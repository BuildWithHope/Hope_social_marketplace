import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    wallet_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    phone_number = models.CharField(max_length=30, blank=True, null=True)
    company_name = models.CharField(max_length=100, blank=True, null=True)
    api_key = models.CharField(max_length=100, unique=True, default=uuid.uuid4)

    def __str__(self):
        return self.username

class PasswordResetCode(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reset_codes')
    code = models.CharField(max_length=10)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Reset code for {self.user.username}: {self.code}"
