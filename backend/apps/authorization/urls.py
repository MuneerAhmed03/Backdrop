from django.urls import path
from .views import  CreateUserView, TestView

app_name="apps.authorization"
urlpatterns = [
    # path('google-login/', GoogleLoginView.as_view(), name='google-login'),
    # path('refresh-token/', TokenRefreshCookieView.as_view(), name='refresh-token'),
    path('create-user/',CreateUserView.as_view(),name='create-user'),
    path('test/',TestView.as_view(),name='test')
]
