
from celery import shared_task

@shared_task(name='worker.tasks.execute_code_task', bind=True, acks_late=True, queue='execution_queue')
def execute_code(self, code):
    """
    Proxy task that forwards the code execution request to the worker.
    The actual implementation is in the worker package on the Celery workers.
    
    By setting the name to 'worker.tasks.execute_code_task', we ensure this task
    matches the implementation in the worker container.
    """
    # The actual implementation is in the worker container
    # This proxy just defines the task interface for the Django app
    raise NotImplementedError("This is a proxy task. The actual implementation is in the worker container.")