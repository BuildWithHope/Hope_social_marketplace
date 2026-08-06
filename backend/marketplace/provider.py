import requests
from decimal import Decimal

class SMMProviderClient:
    def __init__(self, api_url, api_key):
        self.api_url = api_url
        self.api_key = api_key

    def get_services(self):
        """Fetch all services from supplier API"""
        try:
            response = requests.post(
                self.api_url,
                data={'key': self.api_key, 'action': 'services'},
                timeout=15
            )
            return response.json() if response.status_code == 200 else []
        except Exception as e:
            print(f"Error fetching services from provider: {e}")
            return []

    def place_order(self, service_id, link, quantity, runs=None, interval=None):
        """Forward order placement to supplier API"""
        data = {
            'key': self.api_key,
            'action': 'add',
            'service': service_id,
            'link': link,
            'quantity': quantity,
        }
        if runs and interval:
            data['runs'] = runs
            data['interval'] = interval

        try:
            response = requests.post(self.api_url, data=data, timeout=15)
            if response.status_code == 200:
                res_data = response.json()
                if 'order' in res_data:
                    return {'success': True, 'order_id': res_data['order']}
                return {'success': False, 'error': res_data.get('error', 'Unknown provider error')}
            return {'success': False, 'error': f"Provider returned HTTP {response.status_code}"}
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def get_order_status(self, order_id):
        """Get single order status from supplier API"""
        try:
            response = requests.post(
                self.api_url,
                data={'key': self.api_key, 'action': 'status', 'order': order_id},
                timeout=15
            )
            return response.json() if response.status_code == 200 else {}
        except Exception as e:
            return {'error': str(e)}

    def get_provider_balance(self):
        """Check supplier account balance"""
        try:
            response = requests.post(
                self.api_url,
                data={'key': self.api_key, 'action': 'balance'},
                timeout=15
            )
            return response.json() if response.status_code == 200 else {}
        except Exception as e:
            return {'error': str(e)}
