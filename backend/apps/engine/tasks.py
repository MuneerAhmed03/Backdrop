from celery import shared_task
from .pool import ContainerPool
import docker
import os
import logging
import pickle
import pandas as pd
import base64
from django.core.cache import cache
from io import StringIO
import asyncio
import aiohttp
import aiofiles

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
    data_url = os.getenv("DATA_URL") + name
    

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(data_url) as response:
                response.raise_for_status()
                text = await response.text()
    except Exception as e:
        logger.error(f"Failed to fetch or cache data: {str(e)}")
        raise

    df = pd.read_csv(StringIO(text))
    cache.set(cache_key, serialize_df(df), timeout=3600 * 24 * 7)
    return df

def filter_df(df,range):
    df['Date'] = pd.to_datetime(df['Date'])

    date_from = pd.to_datetime(range['from'])
    date_to = pd.to_datetime(range['to'])

    filtered_df = df[(df['Date'] >= date_from) & (df['Date'] <= date_to)]

    filtered_df['Date'] =  filtered_df['Date'].dt.strftime('%Y-%m-%d')

    return filtered_df

async def prepare_files(temp_dir, code, data_frame, config):
    loop = asyncio.get_event_loop()
    code_path = os.path.join(temp_dir, "code.py")
    data_path = os.path.join(temp_dir, "data.pkl")
    config_path = os.path.join(temp_dir, "config.txt")

    async def write_code(path,content):
        async with aiofiles.open(path,'w') as f:
            await f.write(content)
        
    async def write_data(path,data):
        async with aiofiles.open(path,'wb') as f:
            await f.write(pickle.dumps(data))
        
    async def write_config(path, config):
        async with aiofiles.open(path, 'w') as f:
            for key,value in config.items():
                logger.info(f"config values {key}={value}")
                await f.write(f"{key}={value}\n")

    await asyncio.gather(
        write_code(code_path, code),
        write_data(data_path, data_frame),
        write_config(config_path, config)
    )
    return code_path, data_path, config_path


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
    code = backtest.get('code')
    config = backtest.get('params')
    range = backtest.get('range')

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    container = None

    try:
        async def async_execution():
            nonlocal container
            container, temp_dir = await pool.acquire_container_async()
            data_frame = await async_fetch_data(name)
            df = filter_df(data_frame,range)
            code_path, data_path, config_path = await prepare_files(temp_dir, code, df, config)

            exec_result = await asyncio.to_thread(
                container.exec_run,
                'python /app/execute.py',
                workdir='/host_tmpfs',
                demux=True
            )

            result = exec_result.output[0] if exec_result.output[0] else b''
            stderr = exec_result.output[1].decode() if exec_result.output[1] else ''

            logger.info(f"Raw stdout length: {len(result)} bytes")

            return {
                'exit_code': exec_result.exit_code,
                'stdout': result.decode() if result else '',
                'stderr': stderr,
            }

        return loop.run_until_complete(async_execution())

    except docker.errors.APIError as e:
        self.retry(exc=e, countdown=5, max_retries=3)
    finally:
        if container:
            pool.release_container(container)
        if 'loop' in locals():
            loop.close() 