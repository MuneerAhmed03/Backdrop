from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed


User = get_user_model()


class ValidateGoogleToken(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None

        token = auth_header.split(' ')[1]
        try:
            idinfo = id_token.verify_oauth2_token(
                token, 
                requests.Request(), 
                settings.GOOGLE_CLIENT_ID
            )
            print(idinfo)
            verified_email = idinfo['email']
            name = idinfo['name']
            print(f"initialising session for user with email {verified_email} and name {name}")
            user, _ = User.objects.get_or_create(email=verified_email,username=name)
            return (user, None)
        except Exception as e:
            raise AuthenticationFailed(f'Invalid token: {str(e)}')

class CreateUserView(APIView):

    authentication_classes = [ValidateGoogleToken]
    permission_classes = []

    def post(self, request):
        user = request.user
        print(f"user from creste user view: {user} && {user.username}")
        if not user.email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)            
        return Response({"message": "Success"}, status=status.HTTP_200_OK)

class TestView(APIView):
    def post(self, request):
        print(request.user)
        return Response({"message": "Success"}, status=status.HTTP_200_OK)
