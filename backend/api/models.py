from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid

class User(AbstractUser):
    """Extended User model for authentication"""
    professional_role = models.CharField(max_length=200, blank=True)
    department = models.CharField(max_length=200, blank=True)
    api_key = models.CharField(max_length=100, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
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
        if not self.api_key:
            self.api_key = f"ro_live_{uuid.uuid4().hex[:28]}"
        super().save(*args, **kwargs)

    class Meta:
        db_table = 'users'

class Dataset(models.Model):
    """Store uploaded datasets"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='datasets')
    filename = models.CharField(max_length=255)
    file_path = models.CharField(max_length=500)
    file_size = models.BigIntegerField()
    rows_count = models.IntegerField(null=True, blank=True)
    columns_count = models.IntegerField(null=True, blank=True)
    status = models.CharField(max_length=50, default='uploaded')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'datasets'
        ordering = ['-uploaded_at']

class Prediction(models.Model):
    """Store prediction results with stable store_location field."""
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
    # Stored once at creation — never recalculated, never random
    store_location = models.CharField(max_length=100, default='Store #1')
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    def save(self, *args, **kwargs):
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
    """Store model performance metrics"""
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
    Stores the input feature values used for each prediction.
    These are the actual dataset column values that were fed into the model.
    Used by the explainability engine to compute real feature importance scores.
    """
    prediction = models.OneToOneField(
        Prediction, on_delete=models.CASCADE, related_name='features'
    )
    # Core retail features stored as JSON
    # e.g. {"promotion_level": 0.8, "customer_loyalty": 0.6, ...}
    feature_data = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'prediction_features'

class NotificationSettings(models.Model):
    """Store user notification preferences"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_settings')
    model_performance_alerts = models.BooleanField(default=True)
    data_validation_reports = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'notification_settings'
