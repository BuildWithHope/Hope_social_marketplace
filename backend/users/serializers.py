from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'is_superuser', 'wallet_balance', 'phone_number', 'company_name', 'api_key']
        read_only_fields = ['wallet_balance', 'api_key', 'is_staff', 'is_superuser']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name']

    def validate_email(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("An email address is required for account registration.")
        
        clean_email = value.strip().lower()
        
        from django.core.validators import validate_email as django_validate_email
        from django.core.exceptions import ValidationError
        
        try:
            django_validate_email(clean_email)
        except ValidationError:
            raise serializers.ValidationError("Please enter a valid email address (e.g. name@example.com).")

        parts = clean_email.split('@')
        if len(parts) != 2 or '.' not in parts[1] or len(parts[1].split('.')[-1]) < 2:
            raise serializers.ValidationError("Please enter a valid email address with a domain (e.g. name@domain.com).")

        if User.objects.filter(email__iexact=clean_email).exists():
            raise serializers.ValidationError("An account with this email address already exists.")
        return clean_email

    def validate_username(self, value):
        if value and User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("This username is already taken. Please choose another.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        return user
