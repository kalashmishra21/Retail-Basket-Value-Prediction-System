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
    path('metrics/trends/', views.get_trends, name='metrics-trends'),

    # Explainability
    path('explainability/<str:prediction_id>/', views.get_explainability, name='explainability'),
    
    # Router URLs
    path('', include(router.urls)),
]
