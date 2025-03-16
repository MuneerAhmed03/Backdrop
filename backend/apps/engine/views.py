from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .tasks import execute_code_task
from celery.result import AsyncResult
import logging
from redis.exceptions import ConnectionError
import redis
from celery.app.control import Control
from config.celery import app as celery_app
from time import time
from .throttling import CodeExecutionRateThrottle, HealthCheckRateThrottle, TaskResultRateThrottle

logger = logging.getLogger(__name__)

class ServiceStatus:
    @staticmethod
    def check_redis():
        try:
            r = redis.Redis(
                host='localhost',
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
            inspect = celery_app.control.inspect()
            active_workers = inspect.active()
            
            if active_workers is None:
                logger.error("No response from Celery workers")
                return False
            
            queues = inspect.active_queues()
            if not queues:
                logger.error("No active queues found")
                return False
            
            execution_queue_workers = any(
                'execution_queue' in worker_queues[0].get('name', '')
                for worker_queues in queues.values()
                if worker_queues
            )
            
            if not execution_queue_workers:
                logger.error("No workers found for execution_queue")
                return False
            
            logger.info(f"Celery status: Active workers found with execution_queue")
            return True
            
        except Exception as e:
            logger.error(f'Detailed Celery status check failed: {str(e)}', exc_info=True)
            return False

class HealthCheckView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]
    throttle_classes = [HealthCheckRateThrottle]

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
    throttle_classes = [TaskResultRateThrottle]
    
    def get(self, request, task_id):
        try:
            start = time()
            result = AsyncResult(task_id, app=celery_app)
            print(f"Result fetching Time: {(time() - start)*1000} ms")
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
    throttle_classes = [CodeExecutionRateThrottle]
    
    def post(self, request):
        redis_status, redis_message = ServiceStatus.check_redis()
        celery_status = ServiceStatus.celery_status()
        if not redis_status or not celery_status:
            error_details = {
                'error': 'service unavailable',
                'redis_available': redis_status,
                'redis_message': redis_message if not redis_status else None,
                'celery_available': celery_status
            }
            logger.error(f"Service unavailable: {error_details}")
            return Response(error_details, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            
        backtest = request.data.get('backtest')
        name = backtest.get("name")
        logger.info(f"backtest request recieved {backtest}")
        if not backtest:
            return Response({'error': 'missing code'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            task = execute_code_task.apply_async(kwargs={"backtest": backtest}, queue='execution_queue')
            logger.info(f'task scheduled {task} on execution_queue')
            return Response({
                'task_id': task.id,
                'status_url': f'/engine/task/{task.id}/'
            }, status=status.HTTP_202_ACCEPTED)
            
        except Exception as e:
            logger.error(f'code submission failed: {str(e)}')
            return Response({'error': 'processing failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
