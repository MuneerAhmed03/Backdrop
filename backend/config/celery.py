import os
from celery import Celery
from django.conf import settings
import time

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

class MyCelery(Celery):
    def on_connection_error(self, exc, interval):
        print(f"Celery connection error: {exc}. Retrying in {interval} seconds...")

app = MyCelery('config')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# Configure Celery to handle connection errors
app.conf.broker_transport_options = {
    'max_retries': 3,
    'interval_start': 0,
    'interval_step': 0.2,
    'interval_max': 0.5,
}

@app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    max_retries = 5
    retry_delay = 1
    
    for i in range(max_retries):
        try:
            sender.connection()
            print("Successfully connected to broker")
            break
        except Exception as e:
            if i == max_retries - 1:
                print(f"Failed to connect after {max_retries} attempts")
                raise
            print(f"Connection attempt {i + 1} failed, retrying in {retry_delay} seconds...")
            time.sleep(retry_delay)
            retry_delay *= 2

@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
