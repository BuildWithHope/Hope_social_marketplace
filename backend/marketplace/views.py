import uuid
from decimal import Decimal, InvalidOperation
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum
from .models import Service, AccountItem, Order, Transaction, Referral, SupportTicket, TicketReply, Provider
from .serializers import (
    ServiceSerializer, AccountItemSerializer, OrderSerializer,
    TransactionSerializer, ReferralSerializer, SupportTicketSerializer, TicketReplySerializer
)
from .provider import SMMProviderClient

class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            user = request.user
            user_orders = Order.objects.filter(user=user)

            total_orders = user_orders.count()
            active_orders = user_orders.filter(status__in=['Pending', 'Processing', 'In Progress']).count()
            completed_orders = user_orders.filter(status='Completed').count()
            failed_orders = user_orders.filter(status='Failed').count()

            total_spent = user_orders.filter(status='Completed').aggregate(Sum('total_amount'))['total_amount__sum'] or Decimal("0.00")

            monthly_spending = [
                {"month": "Jan", "amount": 42000},
                {"month": "Feb", "amount": 68000},
                {"month": "Mar", "amount": 95000},
                {"month": "Apr", "amount": 120000},
                {"month": "May", "amount": 89000},
                {"month": "Jun", "amount": 145000},
                {"month": "Jul", "amount": 182000},
                {"month": "Aug", "amount": 134000},
                {"month": "Sep", "amount": 160000},
                {"month": "Oct", "amount": 195000},
                {"month": "Nov", "amount": 210000},
                {"month": "Dec", "amount": float(total_spent)},
            ]

            return Response({
                "wallet_balance": user.wallet_balance,
                "total_orders": total_orders,
                "active_orders": active_orders,
                "completed_orders": completed_orders,
                "failed_orders": failed_orders,
                "total_spent": total_spent,
                "monthly_spending": monthly_spending,
            })
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ServiceListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        try:
            services = Service.objects.filter(is_active=True)
            platform = request.query_params.get('platform')
            category = request.query_params.get('category')
            if platform and platform != 'all' and platform != 'All':
                services = services.filter(platform__iexact=platform)
            if category and category != 'all' and category != 'All':
                services = services.filter(category__iexact=category)
            serializer = ServiceSerializer(services, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AccountItemListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        try:
            accounts = AccountItem.objects.filter(is_in_stock=True)
            platform = request.query_params.get('platform')
            if platform and platform != 'all' and platform != 'All':
                accounts = accounts.filter(platform__iexact=platform)
            serializer = AccountItemSerializer(accounts, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class OrderListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            orders = Order.objects.filter(user=request.user).order_by('-date')
            serializer = OrderSerializer(orders, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request):
        try:
            service_id = request.data.get('service')
            quantity_val = request.data.get('quantity', 1000)
            try:
                quantity = int(quantity_val)
            except (ValueError, TypeError):
                quantity = 1000

            target_link = str(request.data.get('target_link', ''))

            if not service_id:
                return Response({"error": "Service ID is required"}, status=status.HTTP_400_BAD_REQUEST)

            try:
                service = Service.objects.get(id=service_id)
            except (Service.DoesNotExist, ValueError):
                return Response({"error": "Service not found"}, status=status.HTTP_404_NOT_FOUND)

            total_amount = (Decimal(quantity) / Decimal(1000)) * service.rate_per_1k

            if request.user.wallet_balance < total_amount:
                return Response({"error": f"Insufficient wallet balance. Total cost is ₦{total_amount:,.2f}"}, status=status.HTTP_400_BAD_REQUEST)

            # Deduct wallet balance locally
            request.user.wallet_balance -= total_amount
            request.user.save()

            provider_order_id = None
            order_status = 'Completed'

            # If connected to a supplier API, forward order to supplier!
            if service.provider and service.provider.is_active and service.provider_service_id:
                client = SMMProviderClient(service.provider.api_url, service.provider.api_key)
                result = client.place_order(service.provider_service_id, target_link, quantity)

                if result.get('success'):
                    provider_order_id = str(result.get('order_id'))
                    order_status = 'Processing'
                else:
                    # Refund user & set failed
                    request.user.wallet_balance += total_amount
                    request.user.save()
                    return Response({
                        "error": f"Supplier API Error: {result.get('error')}. Money refunded to your wallet."
                    }, status=status.HTTP_400_BAD_REQUEST)

            order = Order.objects.create(
                user=request.user,
                service=service,
                service_name=service.name,
                target_link=target_link,
                quantity=quantity,
                total_amount=total_amount,
                status=order_status,
                provider_order_id=provider_order_id,
            )

            Transaction.objects.create(
                user=request.user,
                transaction_type='Order Payment',
                amount=total_amount,
                status='Completed',
                method='Wallet Balance',
                reference=f"ORD-{uuid.uuid4().hex[:8].upper()}"
            )

            return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class TransactionListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            transactions = Transaction.objects.filter(user=request.user).order_by('-date')
            serializer = TransactionSerializer(transactions, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class WalletDepositView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            raw_amount = request.data.get('amount', 10000)
            try:
                amount = Decimal(str(raw_amount))
            except (InvalidOperation, TypeError, ValueError):
                return Response({"error": "Invalid deposit amount"}, status=status.HTTP_400_BAD_REQUEST)

            method = str(request.data.get('method', 'Flutterwave'))

            if amount <= 0:
                return Response({"error": "Amount must be greater than ₦0"}, status=status.HTTP_400_BAD_REQUEST)

            request.user.wallet_balance += amount
            request.user.save()

            tx = Transaction.objects.create(
                user=request.user,
                transaction_type='Deposit',
                amount=amount,
                status='Completed',
                method=method,
                reference=f"DEP-{uuid.uuid4().hex[:8].upper()}"
            )

            return Response({
                "message": f"Successfully deposited ₦{amount:,.2f}",
                "new_balance": request.user.wallet_balance,
                "transaction": TransactionSerializer(tx).data
            })
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ReferralListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            referrals = Referral.objects.filter(referrer=request.user)
            total_earned = referrals.aggregate(Sum('total_commission_earned'))['total_commission_earned__sum'] or Decimal("0.00")
            referral_link = f"http://localhost:3000/register?ref={request.user.username}"

            return Response({
                "referral_link": referral_link,
                "total_referred": referrals.count(),
                "total_earned": total_earned,
                "referrals": ReferralSerializer(referrals, many=True).data,
            })
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class SupportTicketListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            tickets = SupportTicket.objects.filter(user=request.user).order_by('-created_at')
            serializer = SupportTicketSerializer(tickets, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request):
        try:
            subject = request.data.get('subject')
            category = request.data.get('category', 'General Inquiry')
            priority = request.data.get('priority', 'Medium')
            message = request.data.get('message', '')

            if not subject or not message:
                return Response({"error": "Subject and message are required"}, status=status.HTTP_400_BAD_REQUEST)

            ticket = SupportTicket.objects.create(
                user=request.user,
                subject=subject,
                category=category,
                priority=priority,
                status='Open'
            )

            TicketReply.objects.create(
                ticket=ticket,
                user=request.user,
                message=message,
                is_staff_reply=False
            )

            return Response(SupportTicketSerializer(ticket).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class TicketReplyCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, ticket_id):
        try:
            try:
                ticket = SupportTicket.objects.get(id=ticket_id, user=request.user)
            except SupportTicket.DoesNotExist:
                return Response({"error": "Ticket not found"}, status=status.HTTP_404_NOT_FOUND)

            message = request.data.get('message')
            if not message:
                return Response({"error": "Message content is required"}, status=status.HTTP_400_BAD_REQUEST)

            reply = TicketReply.objects.create(
                ticket=ticket,
                user=request.user,
                message=message,
                is_staff_reply=False
            )

            if ticket.status == 'Closed':
                ticket.status = 'Open'
                ticket.save()

            return Response(TicketReplySerializer(reply).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
