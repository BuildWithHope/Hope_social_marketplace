from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from marketplace.models import Service, AccountItem, Transaction, Order

User = get_user_model()

class Command(BaseCommand):
    help = "Seed database with initial services, accounts, and demo user"

    def handle(self, *args, **options):
        self.stdout.write("Seeding database...")

        # 1. Create Demo User
        demo_user, created = User.objects.get_or_create(
            username="hope",
            defaults={
                "email": "hope@example.com",
                "first_name": "Hope",
                "last_name": "User",
                "wallet_balance": Decimal("1284.90"),
                "phone_number": "+1 234 567 8900",
                "company_name": "Hope Social Marketplace",
                "is_staff": True,
                "is_superuser": True,
            }
        )
        demo_user.set_password("Admin2026!")
        demo_user.is_staff = True
        demo_user.is_superuser = True
        demo_user.save()

        # Create Custom Hopesocial Admin User
        hopesocial_admin, h_created = User.objects.get_or_create(
            username="Hopesocial",
            defaults={
                "email": "admin@hopesocial.com",
                "first_name": "HopeSocial",
                "last_name": "Admin",
                "wallet_balance": Decimal("50000.00"),
                "is_staff": True,
                "is_superuser": True,
            }
        )
        hopesocial_admin.set_password("Hope3259.")
        hopesocial_admin.is_staff = True
        hopesocial_admin.is_superuser = True
        hopesocial_admin.save()

        # Create Admin User if missing
        admin, a_created = User.objects.get_or_create(
            username="admin",
            defaults={
                "email": "admin@hopesocial.com",
                "is_staff": True,
                "is_superuser": True,
            }
        )
        admin.set_password("Admin2026!")
        admin.is_staff = True
        admin.is_superuser = True
        admin.wallet_balance = Decimal("5000.00")
        admin.save()
        self.stdout.write(self.style.SUCCESS("Updated Hopesocial and admin superuser accounts successfully!"))

        # 2. Seed Services
        services_data = [
            # Instagram
            {"platform": "Instagram", "category": "Followers", "name": "Instagram Followers — High Quality", "rate_per_1k": Decimal("1.20"), "badge": "Popular", "description": "High quality profiles with profile pictures & posts."},
            {"platform": "Instagram", "category": "Followers", "name": "Instagram Followers — Real & Active", "rate_per_1k": Decimal("2.80"), "badge": "Best", "description": "Real active accounts, high retention rate."},
            {"platform": "Instagram", "category": "Likes", "name": "Instagram Likes — Instant Delivery", "rate_per_1k": Decimal("0.45"), "badge": "Fast", "description": "Instant start within 30 seconds."},
            {"platform": "Instagram", "category": "Views", "name": "Instagram Reels Views — Ultra Fast", "rate_per_1k": Decimal("0.15"), "badge": "Cheap", "description": "High speed views for Reels & Videos."},
            {"platform": "Instagram", "category": "Comments", "name": "Instagram Custom Comments — English", "rate_per_1k": Decimal("8.50"), "badge": "Custom", "description": "Custom comments written by real users."},
            
            # TikTok
            {"platform": "TikTok", "category": "Followers", "name": "TikTok Followers — Instant", "rate_per_1k": Decimal("3.20"), "badge": "Popular", "description": "Instant start followers for TikTok."},
            {"platform": "TikTok", "category": "Likes", "name": "TikTok Video Likes — Real Users", "rate_per_1k": Decimal("0.90"), "badge": "Fast", "description": "High quality likes for TikTok posts."},
            {"platform": "TikTok", "category": "Views", "name": "TikTok Video Views — High Speed", "rate_per_1k": Decimal("0.08"), "badge": "Ultra Fast", "description": "Instant delivery for viral ranking."},

            # YouTube
            {"platform": "YouTube", "category": "Subscribers", "name": "YouTube Subscribers — Non Drop", "rate_per_1k": Decimal("18.50"), "badge": "Non-Drop", "description": "100% Non-Drop YouTube subscribers with 30-day refill guarantee."},
            {"platform": "YouTube", "category": "Views", "name": "YouTube Watch Time Views — High Retention", "rate_per_1k": Decimal("4.20"), "badge": "Monetized", "description": "Real human watch time views for monetization."},
            {"platform": "YouTube", "category": "Likes", "name": "YouTube Video Likes", "rate_per_1k": Decimal("2.10"), "badge": "Instant", "description": "Fast video likes for ranking boost."},

            # Twitter/X
            {"platform": "Twitter/X", "category": "Followers", "name": "Twitter/X Followers — Real Profiles", "rate_per_1k": Decimal("4.50"), "badge": "Organic", "description": "Aged Twitter accounts with tweets & followers."},
            {"platform": "Twitter/X", "category": "Retweets", "name": "Twitter/X Retweets & Likes Combo", "rate_per_1k": Decimal("3.10"), "badge": "Combo", "description": "Combined retweets and likes for high engagement."},

            # Telegram
            {"platform": "Telegram", "category": "Members", "name": "Telegram Channel Members — Global", "rate_per_1k": Decimal("1.10"), "badge": "Fast", "description": "Global channel members, zero drop rate."},
            {"platform": "Telegram", "category": "Views", "name": "Telegram Post Views — Last 5 Posts", "rate_per_1k": Decimal("0.20"), "badge": "Auto", "description": "Automatic views on your recent channel posts."},
        ]

        for s in services_data:
            Service.objects.get_or_create(name=s["name"], defaults=s)

        self.stdout.write(self.style.SUCCESS(f"Seeded {len(services_data)} services."))

        # 3. Seed Aged Accounts
        accounts_data = [
            {"platform": "Instagram", "name": "Aged Instagram Account", "category": "Niche Account", "followers": "12.4k", "year": 2019, "price": Decimal("140.00"), "country": "USA", "badge": "Popular", "icon_name": "Instagram"},
            {"platform": "Instagram", "name": "Verified Instagram Creator", "category": "Personal Brand", "followers": "45.0k", "year": 2018, "price": Decimal("380.00"), "country": "UK", "badge": "Aged 6Y", "icon_name": "Instagram"},
            {"platform": "TikTok", "name": "TikTok Creator Fund Ready", "category": "Gaming", "followers": "28.5k", "year": 2021, "price": Decimal("210.00"), "country": "USA", "badge": "Monetized", "icon_name": "Music2"},
            {"platform": "YouTube", "name": "Monetized YouTube Channel", "category": "Tech & Gadgets", "followers": "8.2k", "year": 2020, "price": Decimal("490.00"), "country": "Canada", "badge": "Monetized", "icon_name": "Youtube"},
            {"platform": "Twitter/X", "name": "Crypto NFT Twitter Account", "category": "Crypto / Web3", "followers": "18.9k", "year": 2017, "price": Decimal("290.00"), "country": "USA", "badge": "OG 2017", "icon_name": "Twitter"},
            {"platform": "Telegram", "name": "Trading Signals Telegram Channel", "category": "Finance", "followers": "34.1k", "year": 2021, "price": Decimal("320.00"), "country": "Global", "badge": "Active", "icon_name": "Send"},
        ]

        for a in accounts_data:
            AccountItem.objects.get_or_create(name=a["name"], defaults=a)

        self.stdout.write(self.style.SUCCESS(f"Seeded {len(accounts_data)} accounts."))

        # 4. Seed Sample Transactions
        transactions_data = [
            {"transaction_type": "Deposit", "amount": Decimal("500.00"), "status": "Completed", "method": "Flutterwave", "reference": "DEP-982341"},
            {"transaction_type": "Deposit", "amount": Decimal("250.00"), "status": "Completed", "method": "Paystack", "reference": "DEP-871239"},
            {"transaction_type": "Order Payment", "amount": Decimal("18.50"), "status": "Completed", "method": "Wallet Balance", "reference": "ORD-120938"},
            {"transaction_type": "Order Payment", "amount": Decimal("140.00"), "status": "Completed", "method": "Wallet Balance", "reference": "ORD-458921"},
        ]

        for t in transactions_data:
            Transaction.objects.get_or_create(reference=t["reference"], defaults={**t, "user": demo_user})

        self.stdout.write(self.style.SUCCESS("Database seeding completed successfully!"))
