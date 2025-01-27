from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .tasks import execute_code
from celery.result import AsyncResult
import logging
from redis.exceptions import ConnectionError
import redis
from celery.app.control import Control
from config.celery import app as celery_app

logger = logging.getLogger(__name__)

class ServiceStatus:
    @staticmethod
    def check_redis():
        try:
            r = redis.Redis(
                host='redis',
                port=6379,
                db=0,
                socket_connect_timeout=2,
                socket_timeout=2
            )
            r.ping()
            return True, "Connected"
        except (redis.ConnectionError, ConnectionError) as e:
            return False, str(e)

    @staticmethod
    def celery_status():
        try:
            return bool(celery_app.control.ping(timeout=1))
        except Exception as e:
            logger.debug(f'celery ping failed: {str(e)}')
            return False

class HealthCheckView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        services = {
            'redis': ServiceStatus.check_redis(),
            'celery': ServiceStatus.celery_status()
        }
        http_status = status.HTTP_200_OK if all(services.values()) else status.HTTP_503_SERVICE_UNAVAILABLE
        return Response(services, status=http_status)

class TaskResultView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, task_id):
        try:
            result = AsyncResult(task_id, app=celery_app)
            
            if result.successful():
                return Response({
                    'status': 'completed',
                    'result': result.result
                })
            elif result.failed():
                return Response({
                    'status': 'error',
                    'error': str(result.result)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            return Response({
                'status': result.state.lower(),
                'eta': result.result.get('eta') if result.result else None
            })
            
        except Exception as e:
            logger.error(f"Error checking task status: {str(e)}")
            return Response({
                'error': f"Error checking task status: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CodeExecutionView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        if not ServiceStatus.check_redis()[0] or not ServiceStatus.celery_status():
            return Response({
                'error': 'service unavailable'
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            
        code = request.data.get('code')
        if not code:
            return Response({'error': 'missing code'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            task = execute_code.delay(code)
            logger.info(f'task scheduled {task}')
            return Response({
                'task_id': task.id,
                'status_url': f'/engine/task/{task.id}/'
            }, status=status.HTTP_202_ACCEPTED)
            
        except Exception as e:
            logger.error(f'code submission failed: {str(e)}')
            return Response({'error': 'processing failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
