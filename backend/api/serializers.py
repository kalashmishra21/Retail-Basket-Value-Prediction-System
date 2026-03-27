from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import User, Dataset, Prediction, ModelMetrics, NotificationSettings
import re

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model
    Returns user data without sensitive information like password
    """
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name',
                  'professional_role', 'department', 'api_key', 'created_at']
        read_only_fields = ['id', 'api_key', 'created_at']
    
    def get_full_name(self, obj):
        """
        Get user's full name from first_name and last_name
        Returns combined name or username if names not set
        """
        if obj.first_name and obj.last_name:
            return f"{obj.first_name} {obj.last_name}"
        elif obj.first_name:
            return obj.first_name
        return obj.username

class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration with strong password validation
    Enforces password strength requirements and validates all user data
    """
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'confirm_password', 
                  'first_name', 'last_name']

    def validate_password(self, value):
        """
        Validate password strength with strict requirements
        Must contain: 8+ chars, uppercase, lowercase, number, special character
        """
        if len(value) < 8:
            raise serializers.ValidationError(
                "Password must be at least 8 characters long"
            )
        
        # Check for uppercase letter
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError(
                "Password must contain at least one uppercase letter"
            )
        
        # Check for lowercase letter
        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError(
                "Password must contain at least one lowercase letter"
            )
        
        # Check for digit
        if not re.search(r'\d', value):
            raise serializers.ValidationError(
                "Password must contain at least one number"
            )
        
        # Check for special character
        if not re.search(r'[@$!%*?&#^()_+=\-\[\]{}|\\:;"\'<>,.\/]', value):
            raise serializers.ValidationError(
                "Password must contain at least one special character (@$!%*?&#, etc.)"
            )
        
        return value

    def validate(self, data):
        """
        Validate that passwords match and all required fields are present
        Ensures data consistency before user creation
        """
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({
                "confirm_password": "Passwords do not match"
            })
        return data

    def create(self, validated_data):
        """
        Create new user with hashed password
        Automatically creates notification settings for new user
        """
        validated_data.pop('confirm_password')
        user = User.objects.create_user(**validated_data)
        NotificationSettings.objects.create(user=user)
        return user

class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for user login
    Validates email and password format before authentication
    """
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)

class DatasetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dataset
        fields = '__all__'
        read_only_fields = ['user', 'uploaded_at']

class PredictionSerializer(serializers.ModelSerializer):
    """
    Serializer for Prediction model.
    Includes dataset_rows_count and store_location as stable read-only fields.
    store_location is stored in DB — never recalculated, never random.
    """
    dataset_rows_count = serializers.SerializerMethodField()

    class Meta:
        model = Prediction
        fields = '__all__'
        read_only_fields = ['user', 'prediction_id', 'created_at', 'store_location']

    def get_dataset_rows_count(self, obj):
        """Return rows_count from the linked Dataset, or None if not linked."""
        if obj.dataset:
            return obj.dataset.rows_count
        return None

class ModelMetricsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModelMetrics
        fields = '__all__'

class NotificationSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationSettings
        fields = ['model_performance_alerts', 'data_validation_reports']
