"""
Database Models for Retail Basket Value Prediction System

This module defines all database models used in the application:
- User: Extended authentication model with API key support
- Dataset: Stores uploaded CSV files metadata
- Prediction: Stores ML prediction results
- ModelMetrics: Tracks model performance over time
- PredictionFeatures: Stores feature values for explainability
- NotificationSettings: User notification preferences
- APIRequestLog: API request tracking for analytics
"""
from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid


class User(AbstractUser):
    """
    Extended User model with additional fields for the prediction system.
    
    Purpose:
    - Handles user authentication and authorization
    - Stores user profile information
    - Generates unique API keys for programmatic access
    
    Additional Fields:
    - professional_role: User's job title or role
    - department: User's department or team
    - api_key: Unique API key for REST API access
    """
    professional_role = models.CharField(max_length=200, blank=True)
    department = models.CharField(max_length=200, blank=True)
    api_key = models.CharField(max_length=100, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Override default groups and permissions to avoid conflicts
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='api_users',
        blank=True,
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='api_users',
        blank=True,
        verbose_name='user permissions',
    )

    def save(self, *args, **kwargs):
        """
        Override save to auto-generate API key if not present.
        API key format: ro_live_<28_character_hex>
        """
        if not self.api_key:
            self.api_key = f"ro_live_{uuid.uuid4().hex[:28]}"
        super().save(*args, **kwargs)

    class Meta:
        db_table = 'users'


class Dataset(models.Model):
    """
    Stores metadata about uploaded datasets.
    
    Purpose:
    - Track all uploaded CSV files
    - Store file statistics (size, rows, columns)
    - Link datasets to predictions
    
    Note: Actual file content is processed in-memory, not stored in DB
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='datasets')
    filename = models.CharField(max_length=255)
    file_path = models.CharField(max_length=500)
    file_size = models.BigIntegerField()  # Size in bytes
    rows_count = models.IntegerField(null=True, blank=True)
    columns_count = models.IntegerField(null=True, blank=True)
    status = models.CharField(max_length=50, default='uploaded')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'datasets'
        ordering = ['-uploaded_at']


class Prediction(models.Model):
    """
    Stores ML prediction results with deterministic store locations.
    
    Purpose:
    - Store basket value predictions from XGBoost model
    - Track prediction status (processing/completed/failed)
    - Link predictions to source datasets
    
    Important:
    - prediction_id: Auto-generated sequential ID (PRED-XXXX)
    - store_location: Deterministic, set once at creation (never random)
    - predicted_value: Basket value prediction in dollars
    - confidence: Model confidence score (0-100%)
    """
    STATUS_CHOICES = [
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='predictions')
    dataset = models.ForeignKey(Dataset, on_delete=models.SET_NULL, null=True, blank=True)
    prediction_id = models.CharField(max_length=50, unique=True, db_index=True)
    predicted_value = models.DecimalField(max_digits=10, decimal_places=2)
    confidence = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='processing')
    # Stored once at creation — never recalculated, ensures stability
    store_location = models.CharField(max_length=100, default='Store #1')
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    def save(self, *args, **kwargs):
        """
        Override save to auto-generate sequential prediction_id.
        Format: PRED-XXXX (e.g., PRED-6900, PRED-6901, etc.)
        """
        if not self.prediction_id:
            last_pred = Prediction.objects.order_by('-id').first()
            if last_pred and last_pred.prediction_id:
                try:
                    last_num = int(last_pred.prediction_id.split('-')[1])
                    self.prediction_id = f"PRED-{last_num + 1:04d}"
                except (IndexError, ValueError):
                    self.prediction_id = f"PRED-{last_pred.id + 1:04d}"
            else:
                self.prediction_id = "PRED-6900"
        super().save(*args, **kwargs)

    class Meta:
        db_table = 'predictions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['user', 'status']),
        ]


class ModelMetrics(models.Model):
    """
    Stores model performance metrics over time.
    
    Purpose:
    - Track RMSE, MAE, R² scores
    - Monitor model drift
    - Record training timestamps
    
    Metrics Explained:
    - RMSE: Root Mean Square Error (lower is better)
    - MAE: Mean Absolute Error (lower is better)
    - R²: Coefficient of determination (higher is better, 0-1 range)
    """
    rmse = models.DecimalField(max_digits=10, decimal_places=4)
    mae = models.DecimalField(max_digits=10, decimal_places=4)
    r_squared = models.DecimalField(max_digits=5, decimal_places=4, null=True, blank=True)
    total_predictions = models.IntegerField(default=0)
    last_trained = models.DateTimeField()
    drift_detected = models.BooleanField(default=False)
    status = models.CharField(max_length=50, default='optimal')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'model_metrics'
        ordering = ['-created_at']


class PredictionFeatures(models.Model):
    """
    Stores input feature values for each prediction.
    
    Purpose:
    - Enable explainability analysis (feature importance)
    - Store actual dataset values used for prediction
    - Support SHAP/LIME-style explanations
    
    Structure:
    - feature_data: JSON field containing all input features
      Example: {
          "promotion_level": 0.8,
          "customer_loyalty": 0.6,
          "time_of_day": 14,
          "previous_spend": 250.50,
          ...
      }
    """
    prediction = models.OneToOneField(
        Prediction, on_delete=models.CASCADE, related_name='features'
    )
    # Core retail features stored as JSON
    feature_data = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'prediction_features'


class NotificationSettings(models.Model):
    """
    Stores user notification preferences.
    
    Purpose:
    - Control email/alert notifications
    - Customize user experience
    - Enable/disable specific notification types
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_settings')
    model_performance_alerts = models.BooleanField(default=True)
    data_validation_reports = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'notification_settings'


class APIRequestLog(models.Model):
    """
    Tracks all API requests for monitoring and analytics.
    
    Purpose:
    - Monitor API performance (response times)
    - Track error rates and system health
    - Provide data for analytics dashboards
    - Debug production issues
    
    Fields:
    - endpoint: API path (e.g., /api/predictions/)
    - method: HTTP method (GET, POST, PUT, DELETE)
    - status_code: HTTP status code (200, 404, 500, etc.)
    - response_time: Time taken to process request (milliseconds)
    - error_message: Error details if status_code >= 400
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    endpoint = models.CharField(max_length=255)
    method = models.CharField(max_length=10)
    status_code = models.IntegerField()
    response_time = models.FloatField(help_text='Response time in milliseconds')
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    error_message = models.TextField(blank=True, null=True)
    
    class Meta:
        db_table = 'api_request_logs'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['timestamp', 'status_code']),
            models.Index(fields=['user', 'timestamp']),
        ]

