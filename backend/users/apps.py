import os
from django.apps import AppConfig
from django.db.models.signals import post_migrate

def auto_seed_superusers(sender, **kwargs):
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        admin_pass = os.environ.get("ADMIN_PASSWORD", "Admin2026!").strip()

        for uname, email in [("admin", "admin@hopesocial.com"), ("hope", "hope@example.com")]:
            u, created = User.objects.get_or_create(
                username=uname,
                defaults={
                    "email": email,
                    "is_staff": True,
                    "is_superuser": True,
                    "is_active": True,
                }
            )
            u.set_password(admin_pass)
            u.is_staff = True
            u.is_superuser = True
            u.is_active = True
            u.save()
    except Exception:
        pass

class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'users'

    def ready(self):
        post_migrate.connect(auto_seed_superusers, sender=self)


