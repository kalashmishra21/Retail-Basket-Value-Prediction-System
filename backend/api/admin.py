from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Dataset, Prediction, ModelMetrics, NotificationSettings

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'professional_role', 'department']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('professional_role', 'department', 'api_key')}),
    )

@admin.register(Dataset)
class DatasetAdmin(admin.ModelAdmin):
    list_display = ['filename', 'user', 'file_size', 'rows_count', 'status', 'uploaded_at']
    list_filter = ['status', 'uploaded_at']
    search_fields = ['filename', 'user__username']

@admin.register(Prediction)
class PredictionAdmin(admin.ModelAdmin):
    list_display = ['prediction_id', 'user', 'predicted_value', 'confidence', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['prediction_id', 'user__username']

@admin.register(ModelMetrics)
class ModelMetricsAdmin(admin.ModelAdmin):
    list_display = ['rmse', 'mae', 'r_squared', 'total_predictions', 'status', 'created_at']
    list_filter = ['status', 'created_at']

@admin.register(NotificationSettings)
class NotificationSettingsAdmin(admin.ModelAdmin):
    list_display = ['user', 'model_performance_alerts', 'data_validation_reports']
