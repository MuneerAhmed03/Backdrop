import redis
import subprocess
import os
import tempfile
import json
import psutil
import logging
from contextlib import contextmanager
import signal
import time
import uuid

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants
MAX_EXECUTION_TIME = 30  # seconds
MAX_MEMORY = 512 * 1024 * 1024  # 512MB in bytes
REDIS_QUEUE_KEY = 'code_execution_queue'
REDIS_RESULT_KEY_PREFIX = 'code_result:'

class TimeoutException(Exception):
    pass

@contextmanager
def time_limit(seconds):
    def signal_handler(signum, frame):
        raise TimeoutException("Code execution timed out")
    
    signal.signal(signal.SIGALRM, signal_handler)
    signal.alarm(seconds)
    
    try:
        yield
    finally:
        signal.alarm(0)

def monitor_process(proc):
    """Monitor process resources"""
    try:
        process = psutil.Process(proc.pid)
        while proc.poll() is None:
            memory_info = process.memory_info()
            if memory_info.rss > MAX_MEMORY:
                proc.kill()
                return False, "Memory limit exceeded"
            time.sleep(0.1)
        return True, None
    except psutil.NoSuchProcess:
        return True, None
    except Exception as e:
        return False, str(e)

def execute_code(code, task_id):
    """Execute code in a sandboxed environment"""
    try:
        # Create a temporary file to store the code
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(code)
            temp_file = f.name
            logger.info(f"printing code from execute code {code}")
        try:
            with time_limit(MAX_EXECUTION_TIME):
                # Execute the code in a separate process
                proc = subprocess.Popen(
                    ['python', temp_file],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    preexec_fn=os.setsid
                )

                # Monitor process resources
                success, error_msg = monitor_process(proc)
                if not success:
                    os.killpg(os.getpgid(proc.pid), signal.SIGKILL)
                    return {
                        'success': False,
                        'error': error_msg,
                        'task_id': task_id
                    }

                stdout, stderr = proc.communicate()
                
                return {
                    'success': proc.returncode == 0,
                    'result': stdout.decode('utf-8'),
                    'error': stderr.decode('utf-8') if proc.returncode != 0 else None,
                    'task_id': task_id
                }

        except TimeoutException:
            return {
                'success': False,
                'error': 'Code execution timed out',
                'task_id': task_id
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'task_id': task_id
            }
        finally:

            try:
                os.unlink(temp_file)
            except:
                pass

    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'task_id': task_id
        }

def main():
    # Connect to Redis
    redis_client = redis.Redis(
        host='redis',  # Docker service name
        port=6379,
        db=0,
        socket_timeout=5,
        retry_on_timeout=True
    )

    logger.info("Starting sandbox worker...")
    
    while True:
        try:
            task = redis_client.brpop(REDIS_QUEUE_KEY, timeout=1)
            
            if task is None:
                continue
                
            task_data = json.loads(task[1])
            code = task_data['code']
            task_id = task_data['task_id']
            
            logger.info(f"Executing task {task_id}")
            
            result = execute_code(code, task_id)
            logger.info(f"printing the result {result}")
            result_key = f"{REDIS_RESULT_KEY_PREFIX}{task_id}"
            redis_client.setex(
                result_key,
                3600,
                json.dumps(result)
            )
            
            logger.info(f"Task {task_id} completed")
            
        except redis.RedisError as e:
            logger.error(f"Redis error: {str(e)}")
            time.sleep(1)  # Wait before retry
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            time.sleep(1)  # Wait before retry

if __name__ == '__main__':
    main() 