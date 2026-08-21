import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from django.contrib.auth import get_user_model
from decimal import Decimal

User = get_user_model()

def create_or_update_superuser(username, email, password):
    user, created = User.objects.get_or_create(
        username=username,
        defaults={
            "email": email,
            "is_staff": True,
            "is_superuser": True,
            "wallet_balance": Decimal("50000.00"),
        }
    )
    user.email = email
    user.set_password(password)
    user.is_staff = True
    user.is_superuser = True
    user.is_active = True
    user.save()

    status_str = "Created new" if created else "Updated existing"
    print(f"SUCCESS: {status_str} superuser '@{username}' ({email}) with admin permissions.")

if __name__ == "__main__":
    if len(sys.argv) >= 4:
        u = sys.argv[1]
        e = sys.argv[2]
        p = sys.argv[3]
        create_or_update_superuser(u, e, p)
    else:
        print("Usage: python create_custom_admin.py <username> <email> <password>")
