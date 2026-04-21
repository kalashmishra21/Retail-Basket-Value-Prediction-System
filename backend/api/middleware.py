"""
API Request Monitoring Middleware

This middleware tracks all API requests for analytics and system health monitoring.
It records request details including endpoint, method, response time, and status codes.
This data is used for performance analysis and debugging.
"""
import time
from django.utils.deprecation import MiddlewareMixin
from .models import APIRequestLog


class APIMonitoringMiddleware(MiddlewareMixin):
    """
    Middleware to log all API requests for monitoring and analytics.
    
    Purpose:
    - Track API performance (response times)
    - Monitor error rates and system health
    - Provide data for analytics dashboards
    
    How it works:
    1. Records start time when request arrives
    2. Calculates response time after processing
    3. Logs details to APIRequestLog model
    4. Only tracks /api/* endpoints (skips static files)
    """
    
    def process_request(self, request):
        """
        Called before view processing.
        Records the request start time for latency calculation.
        """
        request._start_time = time.time()
        return None
    
    def process_response(self, request, response):
        """
        Called after view processing.
        Calculates response time and logs request details to database.
        
        Args:
            request: Django HttpRequest object
            response: Django HttpResponse object
            
        Returns:
            response: Unmodified response object
        """
        if hasattr(request, '_start_time'):
            # Calculate response time in milliseconds
            response_time = (time.time() - request._start_time) * 1000
            
            # Only log API endpoints (skip static files, admin, etc.)
            if request.path.startswith('/api/'):
                try:
                    APIRequestLog.objects.create(
                        user=request.user if request.user.is_authenticated else None,
                        endpoint=request.path,
                        method=request.method,
                        status_code=response.status_code,
                        response_time=round(response_time, 2),
                        error_message=None if response.status_code < 400 else f"HTTP {response.status_code}"
                    )
                except Exception as e:
                    # Don't break the request if logging fails
                    # This ensures the middleware never causes application errors
                    print(f"Failed to log API request: {e}")
        
        return response
    
    def process_exception(self, request, exception):
        """
        Called when a view raises an exception.
        Logs the error with 500 status code for debugging.
        
        Args:
            request: Django HttpRequest object
            exception: The exception that was raised
            
        Returns:
            None: Allows Django to handle the exception normally
        """
        if hasattr(request, '_start_time'):
            response_time = (time.time() - request._start_time) * 1000
            
            if request.path.startswith('/api/'):
                try:
                    APIRequestLog.objects.create(
                        user=request.user if request.user.is_authenticated else None,
                        endpoint=request.path,
                        method=request.method,
                        status_code=500,
                        response_time=round(response_time, 2),
                        error_message=str(exception)
                    )
                except Exception as e:
                    print(f"Failed to log API exception: {e}")
        
        return None

