from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from google.oauth2 import id_token
from google.auth.transport import requests

User = get_user_model()

class SessionTokenAuthentication(BaseAuthentication):
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
            email = idinfo.get('email')
            if not email:
                raise AuthenticationFailed('Email not found in token')

            user = User.objects.get(email=email)
            return (user, None)

        except ValueError as e:
            print(f"Google token verification failed: {e}")
            raise AuthenticationFailed('Invalid token')
        except User.DoesNotExist:
            raise AuthenticationFailed('User not found')
        except Exception as e:
            print(f"Unexpected error: {e}")
            raise AuthenticationFailed('Authentication failed')