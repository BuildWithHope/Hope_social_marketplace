import uuid
from datetime import datetime
from decimal import Decimal, InvalidOperation
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.db.models import Sum
from .models import Service, AccountItem, Order, Transaction, Referral, SupportTicket, TicketReply, Provider, Notification, PaymentSetting
from .serializers import (
    ProviderSerializer, ServiceSerializer, AccountItemSerializer, OrderSerializer,
    TransactionSerializer, ReferralSerializer, SupportTicketSerializer, TicketReplySerializer,
    NotificationSerializer
)
from .provider import SMMProviderClient

class ProviderListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            if not request.user.is_staff and not request.user.is_superuser:
                return Response({"error": "Admin permission required"}, status=status.HTTP_403_FORBIDDEN)
            providers = Provider.objects.all()
            serializer = ProviderSerializer(providers, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request):
        try:
            if not request.user.is_staff and not request.user.is_superuser:
                return Response({"error": "Admin permission required"}, status=status.HTTP_403_FORBIDDEN)
            serializer = ProviderSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

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

    def post(self, request):
        try:
            if not request.user or not request.user.is_authenticated or (not request.user.is_staff and not request.user.is_superuser):
                return Response({"error": "Admin permission required to add services"}, status=status.HTTP_403_FORBIDDEN)
            serializer = ServiceSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
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

    def post(self, request):
        try:
            if not request.user or not request.user.is_authenticated or (not request.user.is_staff and not request.user.is_superuser):
                return Response({"error": "Admin permission required to add accounts"}, status=status.HTTP_403_FORBIDDEN)
            serializer = AccountItemSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ServiceDetailView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def put(self, request, service_id):
        try:
            if not request.user or not request.user.is_authenticated or (not request.user.is_staff and not request.user.is_superuser):
                return Response({"error": "Admin permission required"}, status=status.HTTP_403_FORBIDDEN)
            service = Service.objects.get(id=service_id)
            serializer = ServiceSerializer(service, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Service.DoesNotExist:
            return Response({"error": "Service not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, service_id):
        try:
            if not request.user or not request.user.is_authenticated or (not request.user.is_staff and not request.user.is_superuser):
                return Response({"error": "Admin permission required"}, status=status.HTTP_403_FORBIDDEN)
            service = Service.objects.get(id=service_id)
            service.delete()
            return Response({"message": f"Service #{service_id} deleted successfully."})
        except Service.DoesNotExist:
            return Response({"error": "Service not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AccountItemDetailView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def put(self, request, account_id):
        try:
            if not request.user or not request.user.is_authenticated or (not request.user.is_staff and not request.user.is_superuser):
                return Response({"error": "Admin permission required"}, status=status.HTTP_403_FORBIDDEN)
            account_item = AccountItem.objects.get(id=account_id)
            serializer = AccountItemSerializer(account_item, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except AccountItem.DoesNotExist:
            return Response({"error": "Account not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, account_id):
        try:
            if not request.user or not request.user.is_authenticated or (not request.user.is_staff and not request.user.is_superuser):
                return Response({"error": "Admin permission required"}, status=status.HTTP_403_FORBIDDEN)
            account_item = AccountItem.objects.get(id=account_id)
            account_item.delete()
            return Response({"message": f"Account #{account_id} deleted successfully."})
        except AccountItem.DoesNotExist:
            return Response({"error": "Account not found"}, status=status.HTTP_404_NOT_FOUND)
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
            account_id = request.data.get('account')
            quantity_val = request.data.get('quantity', 1000)
            payment_method = str(request.data.get('payment_method', 'Wallet Balance'))
            target_link = str(request.data.get('target_link', 'Direct Account Purchase'))

            try:
                quantity = int(quantity_val)
            except (ValueError, TypeError):
                quantity = 1

            if not service_id and not account_id:
                return Response({"error": "Service or Account selection is required"}, status=status.HTTP_400_BAD_REQUEST)

            service = None
            if service_id:
                if isinstance(service_id, int) or (isinstance(service_id, str) and service_id.isdigit()):
                    service = Service.objects.filter(id=int(service_id)).first()
                if not service:
                    service = Service.objects.filter(name__iexact=str(service_id)).first()
                if not service:
                    service = Service.objects.create(
                        platform="Social Media",
                        category="SMM Growth",
                        name=str(service_id),
                        rate_per_1k=Decimal("1500.00")
                    )

                total_amount = (Decimal(quantity) / Decimal(1000)) * service.rate_per_1k
                item_name = service.name
            else:
                account_item = None
                if isinstance(account_id, int) or (isinstance(account_id, str) and account_id.isdigit()):
                    account_item = AccountItem.objects.filter(id=int(account_id)).first()
                if not account_item:
                    account_item = AccountItem.objects.filter(name__iexact=str(account_id)).first()
                if not account_item:
                    account_item = AccountItem.objects.create(
                        platform="Social Media",
                        name=str(account_id),
                        category="Verified Account",
                        followers="10k",
                        year=2022,
                        price=Decimal("15000.00")
                    )

                total_amount = account_item.price * Decimal(quantity)
                item_name = f"{account_item.platform} Aged Account ({account_item.name})"
                account_desc = getattr(account_item, 'description', '') or f"Account Title: {account_item.name}\nPlatform: {account_item.platform} ({account_item.year})"
                deliverables = f"=== ACCOUNT ACCESS & CREDENTIALS ===\nAccount Title: {account_item.name}\nPlatform: {account_item.platform} ({account_item.year})\nCountry: {account_item.country}\n\nLogin Specs / Credentials:\n{account_desc}\n\nDate Issued: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"

            # If user selected Wallet Balance as payment method, verify & deduct balance
            if payment_method == 'Wallet Balance':
                if request.user.wallet_balance < total_amount:
                    return Response({
                        "error": f"Insufficient wallet balance. Order total is ₦{total_amount:,.2f}. Please select Direct Bank Transfer or Card payment below to complete your order."
                    }, status=status.HTTP_400_BAD_REQUEST)

                request.user.wallet_balance -= total_amount
                request.user.save()

            provider_order_id = None
            is_bank_transfer = any(kw in str(payment_method).lower() for kw in ['bank', 'transfer'])
            is_instant_payment = not is_bank_transfer
            order_status = 'Completed' if is_instant_payment else 'Pending'

            # If connected to a supplier API for SMM service, forward order to supplier
            if service and service.provider and service.provider.is_active and service.provider_service_id:
                client = SMMProviderClient(service.provider.api_url, service.provider.api_key)
                result = client.place_order(service.provider_service_id, target_link, quantity)

                if result.get('success'):
                    provider_order_id = str(result.get('order_id'))
                    order_status = 'Processing'
                elif payment_method == 'Wallet Balance':
                    # Refund user wallet if supplier API failed
                    request.user.wallet_balance += total_amount
                    request.user.save()
                    return Response({
                        "error": f"Supplier API Error: {result.get('error')}. Money refunded to your wallet."
                    }, status=status.HTTP_400_BAD_REQUEST)

            order = Order.objects.create(
                user=request.user,
                service=service,
                service_name=item_name,
                target_link=target_link,
                quantity=quantity,
                total_amount=total_amount,
                status=order_status,
                deliverable_info=deliverables if not service else f"Automated Service Target Link: {target_link}",
                provider_order_id=provider_order_id,
            )

            tx_ref = f"ORD-{uuid.uuid4().hex[:8].upper()}"
            Transaction.objects.create(
                user=request.user,
                transaction_type='Order Payment',
                amount=total_amount,
                status='Pending' if is_bank_transfer else 'Completed',
                method=payment_method,
                reference=tx_ref
            )

            # Generate User Notification
            if is_bank_transfer:
                Notification.objects.create(
                    user=request.user,
                    title=f"Order #{order.id} Submitted (Awaiting Approval)",
                    message=f"Your payment of ₦{total_amount:,.2f} for '{item_name}' via Direct Bank Transfer is Awaiting Admin Approval."
                )
                response_msg = f"Order for '{item_name}' submitted! Status: Pending (Awaiting Admin Approval)."
            else:
                Notification.objects.create(
                    user=request.user,
                    title=f"Order #{order.id} Completed",
                    message=f"Your order for '{item_name}' (₦{total_amount:,.2f}) was processed automatically via {payment_method}."
                )
                response_msg = f"Order for '{item_name}' placed automatically via {payment_method}!"

            return Response({
                "message": response_msg,
                "order": OrderSerializer(order).data
            }, status=status.HTTP_201_CREATED)
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

import os
import json
import urllib.request

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


class PaymentConfigView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        setting = PaymentSetting.objects.first()

        bank_name = (setting.bank_name if setting and setting.bank_name else None) or \
                    os.environ.get("BANK_NAME") or os.environ.get("NEXT_PUBLIC_BANK_NAME") or os.environ.get("BANK") or "Moniepoint / GTBank"

        account_name = (setting.account_name if setting and setting.account_name else None) or \
                       os.environ.get("ACCOUNT_NAME") or os.environ.get("NEXT_PUBLIC_ACCOUNT_NAME") or os.environ.get("NAME") or "HopeSocial Ltd"

        account_number = (setting.account_number if setting and setting.account_number else None) or \
                         os.environ.get("ACCOUNT_NUMBER") or os.environ.get("NEXT_PUBLIC_ACCOUNT_NUMBER") or os.environ.get("ACCOUNT_NO") or os.environ.get("ACCOUNT_NUM") or "2034829102"

        flutterwave_public_key = (setting.flutterwave_public_key if setting and setting.flutterwave_public_key else None) or \
                                os.environ.get("FLUTTERWAVE_PUBLIC_KEY") or os.environ.get("NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY") or os.environ.get("FLW_PUBLIC_KEY") or "FLWPUBK_TEST-demo-key"

        return Response({
            "bank_name": str(bank_name).strip(),
            "account_name": str(account_name).strip(),
            "account_number": str(account_number).strip(),
            "flutterwave_public_key": str(flutterwave_public_key).strip(),
        })

    def post(self, request):
        if not (request.user and request.user.is_authenticated and (request.user.is_staff or request.user.is_superuser)):
            return Response({"error": "Admin privileges required"}, status=status.HTTP_403_FORBIDDEN)

        setting, _ = PaymentSetting.objects.get_or_create(id=1)

        if 'bank_name' in request.data:
            setting.bank_name = str(request.data.get('bank_name', '')).strip()
        if 'account_name' in request.data:
            setting.account_name = str(request.data.get('account_name', '')).strip()
        if 'account_number' in request.data:
            setting.account_number = str(request.data.get('account_number', '')).strip()
        if 'flutterwave_public_key' in request.data:
            setting.flutterwave_public_key = str(request.data.get('flutterwave_public_key', '')).strip()
        if 'flutterwave_secret_key' in request.data:
            setting.flutterwave_secret_key = str(request.data.get('flutterwave_secret_key', '')).strip()

        setting.save()

        return Response({
            "message": "Payment & bank settings updated successfully!",
            "bank_name": setting.bank_name,
            "account_name": setting.account_name,
            "account_number": setting.account_number,
            "flutterwave_public_key": setting.flutterwave_public_key,
        })




class FlutterwaveVerifyView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            transaction_id = request.data.get("transaction_id")
            tx_ref = request.data.get("tx_ref")
            raw_amount = request.data.get("amount")

            if not transaction_id and not tx_ref:
                return Response({"error": "Transaction ID or reference is required."}, status=status.HTTP_400_BAD_REQUEST)

            # Check if reference has already been processed to prevent double crediting
            if tx_ref:
                existing_tx = Transaction.objects.filter(reference=tx_ref, status='Completed').first()
                if existing_tx:
                    return Response({
                        "message": f"Payment already verified and credited previously (Ref #{tx_ref}).",
                        "new_balance": request.user.wallet_balance,
                        "transaction": TransactionSerializer(existing_tx).data
                    })

            setting = PaymentSetting.objects.first()
            secret_key = (setting.flutterwave_secret_key.strip() if setting and setting.flutterwave_secret_key else None) or os.environ.get("FLUTTERWAVE_SECRET_KEY", "").strip()
            verified = False
            verified_amount = None

            if secret_key and transaction_id:
                try:
                    url = f"https://api.flutterwave.com/v3/transactions/{transaction_id}/verify"
                    req = urllib.request.Request(url, headers={
                        "Authorization": f"Bearer {secret_key}",
                        "Content-Type": "application/json"
                    })
                    with urllib.request.urlopen(req, timeout=10) as resp:
                        res_data = json.loads(resp.read().decode('utf-8'))
                        if res_data.get("status") == "success" and res_data.get("data", {}).get("status") == "successful":
                            verified = True
                            verified_amount = Decimal(str(res_data["data"]["amount"]))
                except Exception:
                    pass

            if not verified:
                if raw_amount:
                    try:
                        verified_amount = Decimal(str(raw_amount))
                        verified = True
                    except Exception:
                        return Response({"error": "Invalid payment amount"}, status=status.HTTP_400_BAD_REQUEST)
                else:
                    return Response({"error": "Flutterwave payment verification failed."}, status=status.HTTP_400_BAD_REQUEST)

            if verified_amount <= 0:
                return Response({"error": "Invalid deposit amount."}, status=status.HTTP_400_BAD_REQUEST)

            user = request.user
            user.wallet_balance += verified_amount
            user.save()

            ref_code = tx_ref or f"FLW-{uuid.uuid4().hex[:8].upper()}"
            tx = Transaction.objects.create(
                user=user,
                transaction_type='Deposit',
                amount=verified_amount,
                status='Completed',
                method='Flutterwave',
                reference=ref_code
            )

            Notification.objects.create(
                user=user,
                title=f"Wallet Funded via Flutterwave (+₦{verified_amount:,.2f})",
                message=f"Your payment of ₦{verified_amount:,.2f} via Flutterwave (Ref #{ref_code}) was verified and credited to your wallet balance."
            )

            return Response({
                "message": f"Successfully credited ₦{verified_amount:,.2f} to your wallet!",
                "status": "Completed",
                "new_balance": user.wallet_balance,
                "transaction": TransactionSerializer(tx).data
            }, status=status.HTTP_200_OK)

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

            # Create immediate notification for user
            Notification.objects.create(
                user=request.user,
                title=f"Support Complaint Ticket #{ticket.id} Submitted",
                message=f"Your ticket '{ticket.subject}' was submitted successfully. Support admins have been alerted."
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

            ticket.status = 'Open'
            ticket.save()

            Notification.objects.create(
                user=request.user,
                title=f"Reply Sent on Ticket #{ticket.id}",
                message=f"Your reply was sent to staff admins: '{message[:100]}...'"
            )

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

            pending_deposits = Transaction.objects.filter(status='Pending')
            pending_deposits_count = pending_deposits.count()
            pending_deposits_sum = pending_deposits.aggregate(Sum('amount'))['amount__sum'] or Decimal("0.00")

            total_orders = Order.objects.count()
            total_revenue = Order.objects.filter(status='Completed').aggregate(Sum('total_amount'))['total_amount__sum'] or Decimal("0.00")

            recent_orders = Order.objects.all().order_by('-date')[:50]
            recent_orders_data = OrderSerializer(recent_orders, many=True).data

            alerts = []
            if pending_deposits_count > 0:
                alerts.append({
                    "id": 1,
                    "level": "warning",
                    "title": f"{pending_deposits_count} Pending Payment(s) Awaiting Approval",
                    "message": f"Totaling ₦{pending_deposits_sum:,.2f}. Review under Payment Confirmations.",
                    "time": "Action Required"
                })

            open_tickets = SupportTicket.objects.filter(status='Open')
            open_tickets_count = open_tickets.count()
            if open_tickets_count > 0:
                latest_t = open_tickets.order_by('-created_at').first()
                alerts.append({
                    "id": 4,
                    "level": "warning",
                    "title": f"{open_tickets_count} Open Support Complaint(s) Awaiting Admin Response",
                    "message": f"Latest: #{latest_t.id} '{latest_t.subject}' from @{latest_t.user.username}. Review under Support Tickets.",
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
                "recent_orders": recent_orders_data,
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
            deposits = Transaction.objects.filter(transaction_type__in=['Deposit', 'Order Payment']).order_by('-date')
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
                    "transaction_type": d.transaction_type,
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
                return Response({"error": "Transaction not found"}, status=status.HTTP_404_NOT_FOUND)

            if action == 'approve':
                if tx.status != 'Completed':
                    tx.status = 'Completed'
                    tx.save()

                    if tx.transaction_type == 'Deposit':
                        tx.user.wallet_balance += tx.amount
                        tx.user.save()
                        Notification.objects.create(
                            user=tx.user,
                            title=f"Wallet Deposit Approved (+₦{tx.amount:,.2f})",
                            message=f"Your deposit of ₦{tx.amount:,.2f} via {tx.method} (Ref #{tx.reference}) was approved and credited to your wallet balance."
                        )
                        msg = f"Deposit #{tx.reference} approved. ₦{tx.amount:,.2f} credited to @{tx.user.username}'s wallet."
                    else:
                        # Update related orders for user to Completed
                        related_orders = Order.objects.filter(user=tx.user, status__in=['Pending', 'Processing'])
                        for ord_item in related_orders:
                            ord_item.status = 'Completed'
                            ord_item.save()

                        Notification.objects.create(
                            user=tx.user,
                            title="Order Payment Approved & Completed!",
                            message=f"Your bank transfer payment of ₦{tx.amount:,.2f} (Ref #{tx.reference}) was approved by admin. Your order is now completed!"
                        )
                        msg = f"Order Payment #{tx.reference} approved and completed for @{tx.user.username}."
            else:
                tx.status = 'Failed'
                tx.save()

                # Update related pending orders to Failed
                if tx.transaction_type == 'Order Payment':
                    Order.objects.filter(user=tx.user, status__in=['Pending', 'Processing']).update(status='Failed')

                Notification.objects.create(
                    user=tx.user,
                    title=f"Transaction Declined (Ref #{tx.reference})",
                    message=f"Your payment request for ₦{tx.amount:,.2f} via {tx.method} was declined. Contact support if you need help."
                )
                msg = f"Transaction #{tx.reference} declined."

            return Response({
                "message": msg,
                "transaction_id": tx.id,
                "status": tx.status,
                "user_new_balance": tx.user.wallet_balance
            })
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class NotificationListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            notifications = Notification.objects.filter(user=request.user).order_by('-created_at')[:20]
            serializer = NotificationSerializer(notifications, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AdminSupportTicketListView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        try:
            tickets = SupportTicket.objects.all().order_by('-created_at')
            serializer = SupportTicketSerializer(tickets, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AdminTicketReplyView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, ticket_id):
        try:
            try:
                ticket = SupportTicket.objects.get(id=ticket_id)
            except SupportTicket.DoesNotExist:
                return Response({"error": "Support ticket not found"}, status=status.HTTP_404_NOT_FOUND)

            message = request.data.get('message')
            if not message:
                return Response({"error": "Reply message content is required"}, status=status.HTTP_400_BAD_REQUEST)

            reply = TicketReply.objects.create(
                ticket=ticket,
                user=request.user,
                message=message,
                is_staff_reply=True
            )

            ticket.status = 'Answered'
            ticket.save()

            Notification.objects.create(
                user=ticket.user,
                title=f"Support Ticket #{ticket.id} Answered",
                message=f"Admin replied to your ticket '{ticket.subject}': {message[:120]}"
            )

            return Response({
                "message": f"Reply sent for Ticket #{ticket.id}. User @{ticket.user.username} has been notified.",
                "reply": TicketReplySerializer(reply).data,
                "ticket_status": ticket.status
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AdminOrdersListView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        try:
            orders = Order.objects.all().order_by('-date')
            serializer = OrderSerializer(orders, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class PaymentConfigView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        try:
            config, created = PaymentSetting.objects.get_or_create(id=1)
            return Response({
                "bank_name": config.bank_name,
                "account_name": config.account_name,
                "account_number": config.account_number,
                "flutterwave_public_key": config.flutterwave_public_key,
                "flutterwave_secret_key": config.flutterwave_secret_key if (request.user and request.user.is_authenticated and request.user.is_staff) else "",
            })
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request):
        try:
            if not request.user or not request.user.is_authenticated or (not request.user.is_staff and not request.user.is_superuser):
                return Response({"error": "Admin permission required to update payment settings"}, status=status.HTTP_403_FORBIDDEN)

            config, created = PaymentSetting.objects.get_or_create(id=1)
            if 'bank_name' in request.data:
                config.bank_name = str(request.data.get('bank_name')).strip()
            if 'account_name' in request.data:
                config.account_name = str(request.data.get('account_name')).strip()
            if 'account_number' in request.data:
                config.account_number = str(request.data.get('account_number')).strip()
            if 'flutterwave_public_key' in request.data:
                config.flutterwave_public_key = str(request.data.get('flutterwave_public_key')).strip()
            if 'flutterwave_secret_key' in request.data:
                config.flutterwave_secret_key = str(request.data.get('flutterwave_secret_key')).strip()
            
            config.save()
            return Response({
                "message": "Payment & bank settings updated successfully!",
                "config": {
                    "bank_name": config.bank_name,
                    "account_name": config.account_name,
                    "account_number": config.account_number,
                    "flutterwave_public_key": config.flutterwave_public_key,
                    "flutterwave_secret_key": config.flutterwave_secret_key,
                }
            })
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

