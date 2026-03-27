from rest_framework.authentication import SessionAuthentication


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    SessionAuthentication without CSRF enforcement.
    Safe for development when using Vite proxy (same-origin requests).
    """
    def enforce_csrf(self, request):
        return  # Skip CSRF check
