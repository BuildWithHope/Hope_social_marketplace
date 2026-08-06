from django.urls import path
from .views import (
    ServiceListView, AccountItemListView, OrderListCreateView,
    TransactionListView, WalletDepositView, DashboardStatsView,
    ReferralListView, SupportTicketListCreateView, TicketReplyCreateView
)

urlpatterns = [
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('services/', ServiceListView.as_view(), name='service-list'),
    path('accounts/', AccountItemListView.as_view(), name='account-list'),
    path('orders/', OrderListCreateView.as_view(), name='order-list-create'),
    path('transactions/', TransactionListView.as_view(), name='transaction-list'),
    path('wallet/deposit/', WalletDepositView.as_view(), name='wallet-deposit'),
    path('referrals/', ReferralListView.as_view(), name='referral-list'),
    path('support/tickets/', SupportTicketListCreateView.as_view(), name='ticket-list-create'),
    path('support/tickets/<int:ticket_id>/reply/', TicketReplyCreateView.as_view(), name='ticket-reply-create'),
]
