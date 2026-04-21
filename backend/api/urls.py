from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'datasets', views.DatasetViewSet, basename='dataset')
router.register(r'predictions', views.PredictionViewSet, basename='prediction')

urlpatterns = [
    # Authentication
    path('auth/register/', views.register_user, name='register'),
    path('auth/login/', views.login_user, name='login'),
    path('auth/logout/', views.logout_user, name='logout'),
    
    # User Profile
    path('user/profile/', views.user_profile, name='user-profile'),
    path('user/generate-api-key/', views.generate_api_key, name='generate-api-key'),
    path('user/notifications/', views.notification_settings, name='notification-settings'),
    
    # Metrics
    path('metrics/latest/', views.calculate_metrics, name='calculate-metrics'),
    path('metrics/summary/', views.metrics_summary, name='metrics-summary'),
    path('metrics/timeseries/', views.metrics_timeseries, name='metrics-timeseries'),
    path('metrics/snapshots/', views.metrics_snapshots, name='metrics-snapshots'),
    path('metrics/trends/', views.get_trends, name='metrics-trends'),

    # Explainability
    path('explainability/<str:prediction_id>/', views.get_explainability, name='explainability'),
    
    # Visualization
    path('visualization/scatter/', views.visualization_scatter, name='visualization-scatter'),
    path('visualization/error-distribution/', views.visualization_error_distribution, name='visualization-error-distribution'),
    path('visualization/category-analysis/', views.visualization_category_analysis, name='visualization-category-analysis'),
    path('visualization/summary/', views.visualization_summary, name='visualization-summary'),
    
    # Router URLs
    path('', include(router.urls)),
]
