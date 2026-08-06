from django.http import JsonResponse

def api_root(request):
    return JsonResponse({
        "status": "online",
        "message": "Welcome to HopeSocial Marketplace Django REST API",
        "endpoints": {
            "admin": "/admin/",
            "users": {
                "register": "/api/users/register/",
                "login": "/api/users/login/",
                "me": "/api/users/me/",
            },
            "marketplace": {
                "dashboard_stats": "/api/dashboard/stats/",
                "services": "/api/services/",
                "accounts": "/api/accounts/",
                "orders": "/api/orders/",
                "transactions": "/api/transactions/",
                "wallet_deposit": "/api/wallet/deposit/",
                "referrals": "/api/referrals/",
                "support_tickets": "/api/support/tickets/",
            }
        }
    })
