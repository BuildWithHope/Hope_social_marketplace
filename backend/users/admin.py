from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'wallet_balance', 'is_staff']
    fieldsets = UserAdmin.fieldsets + (
        ('Wallet & Profile', {'fields': ('wallet_balance', 'phone_number', 'company_name', 'api_key')}),
    )
