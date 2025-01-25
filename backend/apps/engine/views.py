from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .tasks import execute_code, get_execution_result
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
    def check_celery():
        try:
            control = Control(celery_app)
            workers = control.ping(timeout=1)
            if not workers:
                return False, "No workers available"
            return True, "Workers active"
        except Exception as e:
            return False, str(e)

class HealthCheckView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        redis_status, redis_message = ServiceStatus.check_redis()
        celery_status, celery_message = ServiceStatus.check_celery()

        status_info = {
            'redis': {
                'status': 'healthy' if redis_status else 'unhealthy',
                'message': redis_message
            },
            'celery': {
                'status': 'healthy' if celery_status else 'unhealthy',
                'message': celery_message
            }
        }

        overall_status = status.HTTP_200_OK if (redis_status and celery_status) else status.HTTP_503_SERVICE_UNAVAILABLE
        return Response(status_info, status=overall_status)

class TaskResultView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, task_id):
        try:
            # First check if the task is still in Celery
            celery_result = AsyncResult(task_id)
            
            if celery_result.ready():
                # If Celery task is done, check Redis for actual execution result
                result_task = get_execution_result.delay(task_id)
                execution_result = result_task.get(timeout=5)  # Short timeout as this should be quick
                
                if execution_result['status'] == 'completed':
                    return Response(execution_result)
                elif execution_result['status'] == 'error':
                    return Response({
                        'error': execution_result['error']
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
            return Response({
                'status': 'pending',
                'message': 'Task is still processing'
            })
            
        except Exception as e:
            logger.error(f"Error checking task status: {str(e)}")
            return Response({
                'error': f"Error checking task status: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CodeExecutionView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]
    
    def check_services(self):
        redis_status, redis_message = ServiceStatus.check_redis()
        celery_status, celery_message = ServiceStatus.check_celery()
        
        if not redis_status:
            return False, f"Redis service unavailable: {redis_message}"
        if not celery_status:
            return False, f"Celery service unavailable: {celery_message}"
        return True, "Services operational"
    
    def post(self, request):
        services_ok, message = self.check_services()
        if not services_ok:
            logger.error(message)
            return Response({
                'error': message
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            
        code = request.data.get('code')
        
        if not code:
            return Response(
                {'error': 'No code provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            # Execute code asynchronously
            task = execute_code.delay(code)
            
            return Response({
                'task_id': task.id,
                'status': 'pending',
                'message': 'Code execution task has been queued',
                'status_url': f'/engine/task/{task.id}/'
            }, status=status.HTTP_202_ACCEPTED)
            
        except Exception as e:
            logger.error(f"Unexpected error in code execution: {str(e)}")
            return Response({
                'error': 'An unexpected error occurred'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
