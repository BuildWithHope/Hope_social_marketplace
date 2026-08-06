import uuid
from decimal import Decimal, InvalidOperation
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
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

            if total_orders == 0:
                monthly_spending = [
                    {"month": m, "amount": 0}
                    for m in ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                ]
            else:
                monthly_spending = [
                    {"month": "Jan", "amount": 0},
                    {"month": "Feb", "amount": 0},
                    {"month": "Mar", "amount": 0},
                    {"month": "Apr", "amount": 0},
                    {"month": "May", "amount": 0},
                    {"month": "Jun", "amount": 0},
                    {"month": "Jul", "amount": 0},
                    {"month": "Aug", "amount": 0},
                    {"month": "Sep", "amount": 0},
                    {"month": "Oct", "amount": 0},
                    {"month": "Nov", "amount": 0},
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

            method = str(request.data.get('method', 'Bank Transfer'))

            if amount <= 0:
                return Response({"error": "Amount must be greater than ₦0"}, status=status.HTTP_400_BAD_REQUEST)

            # Create transaction with status 'Pending' for admin approval
            tx = Transaction.objects.create(
                user=request.user,
                transaction_type='Deposit',
                amount=amount,
                status='Pending',
                method=method,
                reference=f"DEP-{uuid.uuid4().hex[:8].upper()}"
            )

            return Response({
                "message": f"Deposit request of ₦{amount:,.2f} via {method} submitted successfully! Awaiting admin approval.",
                "status": "Pending",
                "transaction": TransactionSerializer(tx).data
            }, status=status.HTTP_201_CREATED)
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

class AdminOverviewView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        try:
            User = get_user_model()
            total_users = User.objects.count()
            active_users = User.objects.filter(is_active=True).count()
            blocked_users = User.objects.filter(is_active=False).count()

            pending_deposits = Transaction.objects.filter(transaction_type='Deposit', status='Pending')
            pending_deposits_count = pending_deposits.count()
            pending_deposits_sum = pending_deposits.aggregate(Sum('amount'))['amount__sum'] or Decimal("0.00")

            total_orders = Order.objects.count()
            total_revenue = Order.objects.filter(status='Completed').aggregate(Sum('total_amount'))['total_amount__sum'] or Decimal("0.00")

            alerts = []
            if pending_deposits_count > 0:
                alerts.append({
                    "id": 1,
                    "level": "warning",
                    "title": f"{pending_deposits_count} Pending Deposit(s) Awaiting Approval",
                    "message": f"Totaling ₦{pending_deposits_sum:,.2f}. Review under Payment Confirmations.",
                    "time": "Action Required"
                })

            if blocked_users > 0:
                alerts.append({
                    "id": 2,
                    "level": "info",
                    "title": f"{blocked_users} Blocked Account(s)",
                    "message": "User access currently restricted under User Access Control.",
                    "time": "System Log"
                })

            alerts.append({
                "id": 3,
                "level": "success",
                "title": "SMM Provider API Status Normal",
                "message": "Direct supplier order auto-fulfillment engine is operating clean.",
                "time": "System Status"
            })

            return Response({
                "total_users": total_users,
                "active_users": active_users,
                "blocked_users": blocked_users,
                "pending_deposits_count": pending_deposits_count,
                "pending_deposits_sum": pending_deposits_sum,
                "total_orders": total_orders,
                "total_revenue": total_revenue,
                "alerts": alerts,
            })
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AdminUserListView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        try:
            User = get_user_model()
            users = User.objects.all().order_by('-date_joined')
            data = []
            for u in users:
                data.append({
                    "id": u.id,
                    "username": u.username,
                    "email": u.email,
                    "first_name": u.first_name,
                    "last_name": u.last_name,
                    "is_active": u.is_active,
                    "is_staff": u.is_staff,
                    "wallet_balance": u.wallet_balance,
                    "date_joined": u.date_joined,
                })
            return Response(data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AdminUserBlockToggleView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, user_id):
        try:
            User = get_user_model()
            try:
                target_user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

            target_user.is_active = not target_user.is_active
            target_user.save()

            status_str = "unblocked" if target_user.is_active else "blocked"
            return Response({
                "message": f"User @{target_user.username} has been {status_str}.",
                "user": {
                    "id": target_user.id,
                    "username": target_user.username,
                    "is_active": target_user.is_active
                }
            })
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AdminPendingDepositsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        try:
            deposits = Transaction.objects.filter(transaction_type='Deposit').order_by('-date')
            data = []
            for d in deposits:
                data.append({
                    "id": d.id,
                    "reference": d.reference,
                    "user_id": d.user.id,
                    "user_name": d.user.username,
                    "user_email": d.user.email,
                    "amount": d.amount,
                    "method": d.method,
                    "status": d.status,
                    "date": d.date,
                })
            return Response(data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AdminConfirmDepositView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, deposit_id):
        try:
            action = request.data.get('action', 'approve')
            try:
                tx = Transaction.objects.get(id=deposit_id)
            except Transaction.DoesNotExist:
                return Response({"error": "Deposit transaction not found"}, status=status.HTTP_404_NOT_FOUND)

            if action == 'approve':
                if tx.status != 'Completed':
                    tx.status = 'Completed'
                    tx.save()
                    tx.user.wallet_balance += tx.amount
                    tx.user.save()
                msg = f"Deposit #{tx.reference} approved. ₦{tx.amount:,.2f} credited to @{tx.user.username}'s wallet."
            else:
                tx.status = 'Failed'
                tx.save()
                msg = f"Deposit #{tx.reference} declined."

            return Response({
                "message": msg,
                "transaction_id": tx.id,
                "status": tx.status,
                "user_new_balance": tx.user.wallet_balance
            })
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
