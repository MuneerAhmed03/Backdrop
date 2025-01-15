from django.urls import path
from .views import GoogleLoginView, TokenRefreshCookieView

app_name="apps.authorization"
urlpatterns = [
    path('google-login/', GoogleLoginView.as_view(), name='google-login'),
    path('refresh-token/', TokenRefreshCookieView.as_view(), name='refresh-token'),
]
