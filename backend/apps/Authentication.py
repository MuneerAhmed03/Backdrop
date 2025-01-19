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
        print(f"authentication class {token}")
        try:
            payload = jwt.decode(
                token, 
                settings.NEXTAUTH_SECRET,
                algorithms=['HS256', 'RS256']
            )
            
            email = payload.get('email')
            if not email:
                try:
                    idinfo = id_token.verify_oauth2_token(
                        token, 
                        requests.Request(), 
                        settings.GOOGLE_CLIENT_ID
                    )
                    email = idinfo['email']
                except Exception:
                    raise AuthenticationFailed('Invalid token')

            user = User.objects.get(email=email)
            return (user, None)

        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token')
        except User.DoesNotExist:
            raise AuthenticationFailed('User not found')