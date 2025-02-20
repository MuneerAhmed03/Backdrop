import os
import time
import logging
from celery import Celery
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Celery('backdrop')

class CeleryConfig:
    broker_url = os.getenv('CELERY_BROKER_URL', 'redis://redis:6379/0')
    result_backend = os.getenv('CELERY_RESULT_BACKEND', 'redis://redis:6379/0')
    
    task_time_limit = 300
    task_soft_time_limit = 240
    task_acks_late = True
    task_reject_on_worker_lost = True
    task_default_retry_delay = 5
    task_max_retries = 3
    worker_send_task_events = True
    task_send_sent_event = True
    worker_concurrency = int(os.getenv('CELERY_WORKER_CONCURRENCY', '1'))

    task_routes = {
        'apps.engine.tasks.execute_code_task': {'queue': 'execution_queue'},
    }

    imports = (
        'apps.engine.tasks',
    )

    broker_transport_options = {'socket_keepalive': True}

app.config_from_object(CeleryConfig)

if os.getenv('USE_DJANGO', 'true').lower() == 'true':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    app.autodiscover_tasks()

@app.on_after_configure.connect
def retry_broker_connection(sender, **kwargs):
    max_retries = 5
    retry_delay = 1
    
    for i in range(max_retries):
        try:
            sender.connection()
            logger.info("Successfully connected to broker")
            break
        except Exception as e:
            if i == max_retries - 1:
                logger.error(f"Failed to connect after {max_retries} attempts")
                raise
            logger.warning(f"Connection attempt {i + 1} failed, retrying in {retry_delay} seconds...")
            time.sleep(retry_delay)
            retry_delay *= 2

@app.task(bind=True, ignore_result=True)
def debug_task(self):
    logger.info(f'Request: {self.request!r}')
