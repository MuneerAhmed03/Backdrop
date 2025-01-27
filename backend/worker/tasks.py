from celery import shared_task
from .container import ContainerPool
import docker

pool = ContainerPool()

@shared_task(bind=True, acks_late=True, queue='execution_queue')
def execute_code_task(self, code):
    container = None
    try:
        container = pool.acquire_container()
        exec_result = container.exec_run(
            'python /app/execute.py',
            environment={'USER_CODE': code},
            workdir='/tmp',
            demux=True
        )
        return {
            'exit_code': exec_result.exit_code,
            'stdout': exec_result.output[0].decode() if exec_result.output[0] else '',
            'stderr': exec_result.output[1].decode() if exec_result.output[1] else ''
        }
    except docker.errors.APIError as e:
        self.retry(exec=e, countdown=5, max_retries=3)
    finally:
        if container:
            pool.release_container(container) 