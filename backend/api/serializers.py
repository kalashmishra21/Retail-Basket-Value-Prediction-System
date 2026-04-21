"""
Django REST Framework Serializers for API Data Validation and Transformation

This module defines serializers that handle:
- User registration with strong password validation
- User authentication and profile management
- Dataset upload and validation
- Prediction result serialization
- Model metrics and notification settings

All serializers enforce strict validation rules to ensure data integrity
and security before database operations.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import User, Dataset, Prediction, ModelMetrics, NotificationSettings
import re

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model - handles user data representation
    Excludes sensitive fields like password for security
    Provides computed full_name field from first_name + last_name
    Used for profile display and user information endpoints
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
    Serializer for new user registration with comprehensive validation
    Enforces strict password requirements: 8+ chars, uppercase, lowercase, number, special char
    Validates password confirmation match before account creation
    Automatically creates notification settings for new users
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
    Serializer for user authentication
    Validates email format and password length before attempting login
    Does not perform actual authentication - only validates input format
    Authentication logic handled in views.py login_user function
    """
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)

class DatasetSerializer(serializers.ModelSerializer):
    """
    Serializer for Dataset model - handles file upload metadata
    Stores information about uploaded CSV/Excel files
    Auto-assigns current user and timestamp on creation
    Used for tracking data sources and file statistics
    """
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
    """
    Serializer for ModelMetrics model - handles ML model performance data
    Stores RMSE, MAE, R² scores and training metadata
    Used for tracking model accuracy over time
    All metrics computed from real predictions, never hardcoded
    """
    class Meta:
        model = ModelMetrics
        fields = '__all__'

class NotificationSettingsSerializer(serializers.ModelSerializer):
    """
    Serializer for user notification preferences
    Controls which alerts user receives (performance, validation)
    Only exposes user-configurable fields, hides internal metadata
    Used in Settings page for preference management
    """
    class Meta:
        model = NotificationSettings
        fields = ['model_performance_alerts', 'data_validation_reports']
