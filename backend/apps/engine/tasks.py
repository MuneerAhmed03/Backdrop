from celery import shared_task
from .pool import ContainerPool
import docker
import os
import logging
import pickle
import pandas as pd
import requests 
import base64
from django.core.cache import cache
from io import StringIO


logger = logging.getLogger(__name__)

def serialize_df(df):
    return base64.b64encode(pickle.dumps(df)).decode('utf-8')

def deserialize_df(data_str):
    return pickle.loads(base64.b64decode(data_str.encode('utf-8')))

def fetch_data(name):
    cache_key = f"data_{name}"
    cached_data = cache.get(cache_key)

    if cached_data:
        logger.info(f"Using cached data for {name}")
        df =  deserialize_df(cached_data)
    else:
        logger.info("cache_miss")
        data_url = os.getenv("DATA_URL") + name + ".csv"
        try:
            response = requests.get(data_url)
            response.raise_for_status()
            df = pd.read_csv(StringIO(response.text))
            serialized_df = serialize_df(df)
            cache.set(cache_key, serialized_df, timeout=3600 * 24 * 7)

            
        except Exception as e:
            logger.error(f"Failed to fetch or cache data: {str(e)}")

    return df

def create_tar_archive(files):
    import tarfile
    import io

    tar_stream = io.BytesIO()
    with tarfile.open(fileobj=tar_stream, mode='w') as tar:
        for name, content in files.items():
            tarinfo = tarfile.TarInfo(name)
            tarinfo.size = len(content)
            tar.addfile(tarinfo, io.BytesIO(content))
    tar_stream.seek(0)
    return tar_stream.read()

@shared_task(bind=True, acks_late=True, queue='execution_queue')
def execute_code_task(self, backtest):
    pool=None
    if os.getenv("RUNTIME_CELERY","false").lower() == "true":
        logger.info(f'initialising the container')
        pool=ContainerPool()
    else:
        print("django env")

    if not isinstance(backtest, dict):
        logger.error("Invalid 'backtest' argument received.")
    
    name = backtest.get('name')
    logger.info(f"Extracted name: {name} (Type: {type(name)})")
    data_frame = fetch_data(name)
    container = None
    code = backtest.get('code')
    try:
        container ,temp_dir = pool.acquire_container()
        logger.info(f"Acquired container {container.id} with temp path {temp_dir}")

        code_path = os.path.join(temp_dir, "code.py")
        data_path = os.path.join(temp_dir, "data.pkl")

        with open(code_path, 'w') as code_file:
            code_file.write(code)
        with open(data_path, 'wb') as data_file:
            pickle.dump(data_frame, data_file)


        code_size = os.path.getsize(code_path)
        data_size = os.path.getsize(data_path)

        logger.info(f"Size of {code_path}: {code_size} bytes")
        logger.info(f"Size of {data_path}: {data_size} bytes")

        exec_result = container.exec_run(
            'python /app/execute.py',
            workdir='/host_tmpfs',
            demux=True
        )


        result = exec_result.output[0] if exec_result.output[0] else b''
        stderr = exec_result.output[1].decode() if exec_result.output[1] else ''

        logger.info(f"Raw stdout length: {len(result)} bytes")


        return {
            'exit_code': exec_result.exit_code,
            'stdout': result,
            'stderr': stderr,
        }
    except docker.errors.APIError as e:
        self.retry(exec=e, countdown=5, max_retries=3)
    finally:
        if container:
            pool.release_container(container) 