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
import asyncio
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)

def serialize_df(df):
    return base64.b64encode(pickle.dumps(df)).decode('utf-8')

def deserialize_df(data_str):
    return pickle.loads(base64.b64decode(data_str.encode('utf-8')))

async def async_fetch_data(name):
    cache_key = f"data_{name}"
    cached_data = cache.get(cache_key)

    if cached_data:
        logger.info(f"Using cached data for {name}")
        return deserialize_df(cached_data)
    
    logger.info("cache_miss")
    data_url = os.getenv("DATA_URL") + name + ".csv"
    
    loop = asyncio.get_event_loop()
    with ThreadPoolExecutor() as pool:
        try:
            response = await loop.run_in_executor(pool, lambda: requests.get(data_url))
            response.raise_for_status()
            
            df = await loop.run_in_executor(pool, lambda: pd.read_csv(StringIO(response.text)))
            serialized_df = await loop.run_in_executor(pool, lambda: serialize_df(df))
            
            cache.set(cache_key, serialized_df, timeout=3600 * 24 * 7)
            return df
            
        except Exception as e:
            logger.error(f"Failed to fetch or cache data: {str(e)}")
            raise

async def prepare_files(temp_dir, code, data_frame):

    loop = asyncio.get_event_loop()
    code_path = os.path.join(temp_dir, "code.py")
    data_path = os.path.join(temp_dir, "data.pkl")

    async def write_code():
        await loop.run_in_executor(None, lambda: write_file(code_path, code))
        
    async def write_data():
        await loop.run_in_executor(None, lambda: write_pickle(data_path, data_frame))
        
    await asyncio.gather(write_code(), write_data())
    return code_path, data_path

def write_file(path, content):
    with open(path, 'w') as f:
        f.write(content)

def write_pickle(path, data):
    with open(path, 'wb') as f:
        pickle.dump(data, f)

@shared_task(bind=True, acks_late=True, queue='execution_queue')
def execute_code_task(self, backtest):
    pool = None
    if os.getenv("RUNTIME_CELERY","false").lower() == "true":
        logger.info(f'initialising the container')
        pool = ContainerPool()
    else:
        print("django env")

    if not isinstance(backtest, dict):
        logger.error("Invalid 'backtest' argument received.")
    
    name = backtest.get('name')
    logger.info(f"Extracted name: {name} (Type: {type(name)})")
    code = backtest.get('code')
    container = None

    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        container_future = pool.acquire_container_async()
        data_future = async_fetch_data(name)

        container, temp_dir = loop.run_until_complete(container_future)
        data_frame = loop.run_until_complete(data_future)

        code_path, data_path = loop.run_until_complete(prepare_files(temp_dir, code, data_frame))
        
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
        self.retry(exc=e, countdown=5, max_retries=3)
    finally:
        if container:
            pool.release_container(container)
        if 'loop' in locals():
            loop.close() 