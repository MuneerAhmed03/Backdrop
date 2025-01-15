
from django.shortcuts import render
from rest_framework_simplejwt import RefreshToken
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings
from django.contrib.auth import get_user_model


def get_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class GoogleLoginView(APIView):
    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({'error': 'ID token is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            id_info = id_token.verify_oauth2_token(token, requests.Request(), settings.GOOGLE_CLIENT_ID)

            email = id_info.get("email")
            name = id_info.get("name")

            if not email:
                return Response({"error": "Invalid Token: email not found"}, status=status.HTTP_400_BAD_REQUEST)
            
            User = get_user_model()
            
            user, created = User.objects.get_or_create(email=email, defaults={"username": name})

            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            response = Response({"message": "Login Successful"})
            response.set_cookie(
                key="access_token",
                value=access_token,
                httponly=True,
                secure=True,
                max_age=604800
            )
            response.set_cookie(
                key="refresh_token",
                value=refresh_token,
                httponly=True,
                secure=True,
                max_age=604800
            )

            return response
        except ValueError:
            return Response({"error": "Invalid Google Token"}, status=status.HTTP_400_BAD_REQUEST)


class TokenRefreshCookieView(APIView):
    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        if not refresh_token:
            return Response({"error": "No refresh token found"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            token = RefreshToken(refresh_token)
            new_access_token = str(token.access_token)
            new_refresh_token = str(token)
            
            response = Response({"access": new_access_token})
            
            response.set_cookie(
                "refresh_token",
                new_refresh_token,
                httponly=True,
                secure=True,
                samesite='Strict',
            )
            response.set_cookie(
                "access_token",
                new_access_token,
                httponly=True,
                secure=True,
                samesite='Strict',
            )
            return response
        except Exception as e:
            print(f"Error refreshing token: {e}")
            return Response({"error": "Invalid or expired refresh token"}, status=status.HTTP_401_UNAUTHORIZED)

