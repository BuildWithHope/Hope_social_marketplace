from rest_framework import serializers
from .models import Provider, Service, AccountItem, Order, Transaction, Referral, SupportTicket, TicketReply, Notification

class ProviderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Provider
        fields = '__all__'

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'

class AccountItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccountItem
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    user_username = serializers.ReadOnlyField(source='user.username')
    user_email = serializers.ReadOnlyField(source='user.email')

    class Meta:
        model = Order
        fields = ['id', 'user', 'user_username', 'user_email', 'service', 'service_name', 'target_link', 'quantity', 'total_amount', 'status', 'deliverable_info', 'date']
        read_only_fields = ['user', 'date']

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'user', 'transaction_type', 'amount', 'status', 'method', 'reference', 'date']
        read_only_fields = ['user', 'date']

class ReferralSerializer(serializers.ModelSerializer):
    referred_username = serializers.ReadOnlyField(source='referred_user.username')
    referred_email = serializers.ReadOnlyField(source='referred_user.email')

    class Meta:
        model = Referral
        fields = ['id', 'referrer', 'referred_user', 'referred_username', 'referred_email', 'total_commission_earned', 'date']
        read_only_fields = ['referrer', 'date']

class TicketReplySerializer(serializers.ModelSerializer):
    sender_name = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = TicketReply
        fields = ['id', 'ticket', 'user', 'sender_name', 'message', 'is_staff_reply', 'created_at']
        read_only_fields = ['user', 'created_at']

class SupportTicketSerializer(serializers.ModelSerializer):
    replies = TicketReplySerializer(many=True, read_only=False, required=False)

    class Meta:
        model = SupportTicket
        fields = ['id', 'user', 'subject', 'category', 'priority', 'status', 'created_at', 'replies']
        read_only_fields = ['user', 'created_at']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'title', 'message', 'is_read', 'created_at']
        read_only_fields = ['user', 'created_at']
