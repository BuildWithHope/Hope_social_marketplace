from decimal import Decimal
from django.core.management.base import BaseCommand
from marketplace.models import Provider, Service
from marketplace.provider import SMMProviderClient

class Command(BaseCommand):
    help = "Sync services from a supplier API with custom profit margin markup"

    def add_arguments(self, parser):
        parser.add_argument('--provider_id', type=int, help='ID of the Provider in Django Admin')
        parser.add_argument('--margin', type=float, default=30.0, help='Profit margin markup percentage (e.g. 30.0 for 30%%)')

    def handle(self, *args, **options):
        provider_id = options.get('provider_id')
        margin_pct = Decimal(str(options.get('margin', 30.0)))

        providers = Provider.objects.filter(is_active=True)
        if provider_id:
            providers = providers.filter(id=provider_id)

        if not providers.exists():
            self.stdout.write(self.style.ERROR("No active Provider found. Please add a Provider in Django Admin first."))
            return

        for provider in providers:
            self.stdout.write(f"Connecting to provider '{provider.name}' ({provider.api_url})...")
            client = SMMProviderClient(provider.api_url, provider.api_key)
            raw_services = client.get_services()

            if not raw_services:
                self.stdout.write(self.style.WARNING(f"No services returned from {provider.name}."))
                continue

            count = 0
            for item in raw_services:
                service_id = str(item.get('service'))
                name = item.get('name', 'Service')
                category = item.get('category', 'General')
                rate = Decimal(str(item.get('rate', '1.00')))
                min_ord = int(item.get('min', 10))
                max_ord = int(item.get('max', 100000))
                platform = category.split()[0] if category else "Social"

                # Calculate selling rate with profit margin markup
                our_rate = (rate * (Decimal("1.00") + (margin_pct / Decimal("100.00")))).round(2)

                Service.objects.update_or_create(
                    provider=provider,
                    provider_service_id=service_id,
                    defaults={
                        "platform": platform,
                        "category": category,
                        "name": name,
                        "provider_rate": rate,
                        "rate_per_1k": our_rate,
                        "min_order": min_ord,
                        "max_order": max_ord,
                        "is_active": True,
                    }
                )
                count += 1

            self.stdout.write(self.style.SUCCESS(f"Successfully synced {count} services from {provider.name} with {margin_pct}% profit margin markup!"))
