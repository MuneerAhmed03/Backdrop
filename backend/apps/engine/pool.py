import tempfile
import os
import shutil
from queue import Queue
from threading import Lock
import docker
import logging
import asyncio
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

logger = logging.getLogger(__name__)

TMPFS_ROOT = "/mnt/backdrop-tmpfs"          
NETWORK_NAME = "backend_backend"            
IMAGE_NAME = "code-sandbox"

class ContainerPool:
    _instance = None
    _lock = Lock()
    _active_containers = set()
    _executor = ThreadPoolExecutor(max_workers=4)

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            with cls._lock:
                if not cls._instance:
                    cls._instance = super(ContainerPool, cls).__new__(cls, *args, **kwargs)
                    cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        # pathlib.Path(TMPFS_ROOT).mkdir(parents=True, exist_ok=True)
        self.client = docker.from_env()
        self.pool = Queue(maxsize=2)
        self.lock = Lock()
        self.temp_dir_dict = {}
        self._init_pool()

    def _init_pool(self):
        for _ in range(2):
            tmpfs_path = self._create_tmpfs()
            container = self._create_container(tmpfs_path)
            self.temp_dir_dict[container.id] = tmpfs_path
            logger.info("New container %s created with host tmpfs subdir %s", container.id, tmpfs_path)
            self.pool.put(container)

    def _create_tmpfs(self):
        tmpfs_path = tempfile.mkdtemp(prefix="container_", dir=TMPFS_ROOT)
        os.chmod(tmpfs_path, 0o755)
        logger.info("Temporary subdir created at %s", tmpfs_path)
        return tmpfs_path

    def _create_container(self, tmpfs_path: str):
        try:
            container = self.client.containers.run(
                IMAGE_NAME,
                detach=True,
                network=NETWORK_NAME,
                mem_limit='256m',
                read_only=True,                    
                tmpfs={'/tmp': 'rw,noexec,nosuid,size=64M'},  
                volumes={
                    tmpfs_path: {'bind': '/host_tmpfs', 'mode': 'ro'}  
                }
            )
            return container
        except Exception as e:
            logger.error("Failed to create container: %s", e, exc_info=True)
            self._cleanup_tmpfs(tmpfs_path)
            raise

    async def acquire_container_async(self):
        def _acquire():
            with self.lock:
                container = self.pool.get(block=True, timeout=30)
                self._active_containers.add(container.id)
                temp_dir = self.temp_dir_dict[container.id]
                logger.info("Container %s acquired", container.id)
                return container, temp_dir

        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(self._executor, _acquire)

    def acquire_container(self):
        with self.lock:
            container = self.pool.get(block=True, timeout=30)
            self._active_containers.add(container.id)
            temp_dir = self.temp_dir_dict[container.id]
            logger.info("Container %s acquired", container.id)
            return container, temp_dir

    def release_container(self, container):
        try:
            temp_dir = self.temp_dir_dict[container.id]
            self._clear_tmpfs(temp_dir)
            with self.lock:
                self._active_containers.discard(container.id)
                self.pool.put(container)
            logger.info("Container %s released and tmpfs cleared", container.id)
        except Exception as e:
            logger.error("Failed to release container %s: %s", container.id, e, exc_info=True)
            self._replace_container(container)

    def _clear_tmpfs(self, tmpfs_path: str):
        try:
            for name in os.listdir(tmpfs_path):
                p = os.path.join(tmpfs_path, name)
                try:
                    if os.path.isfile(p) or os.path.islink(p):
                        os.unlink(p)
                    elif os.path.isdir(p):
                        shutil.rmtree(p)
                except Exception as e:
                    logger.warning("Failed to remove %s: %s", p, e)
            logger.info("Cleared contents of %s", tmpfs_path)
        except Exception as e:
            logger.error("Failed to clear tmpfs at %s: %s", tmpfs_path, e, exc_info=True)

    def _replace_container(self, container):
        try:
            container.remove(force=True)
            logger.info("Container %s removed", container.id)
        except docker.errors.NotFound:
            logger.warning("Container %s not found during removal", container.id)
        except Exception as e:
            logger.error("Failed to remove container %s: %s", container.id, e, exc_info=True)

        old_tmpfs = self.temp_dir_dict.pop(container.id, None)
        if old_tmpfs:
            self._cleanup_tmpfs(old_tmpfs)

        new_tmpfs = self._create_tmpfs()
        new_container = self._create_container(new_tmpfs)
        self.temp_dir_dict[new_container.id] = new_tmpfs

        with self.lock:
            self.pool.put(new_container)
        logger.info("Replaced container %s with new container %s", container.id, new_container.id)

    def cleanup_all_containers(self):
        logger.info("Cleaning up all containers...")
        with self.lock:
            while not self.pool.empty():
                try:
                    container = self.pool.get_nowait()
                    self._remove_container(container)
                except Exception as e:
                    logger.error("Error removing container from pool: %s", e, exc_info=True)

            for container_id in list(self._active_containers):
                try:
                    container = self.client.containers.get(container_id)
                    self._remove_container(container)
                except Exception as e:
                    logger.error("Error removing active container %s: %s", container_id, e, exc_info=True)

            self._active_containers.clear()
        logger.info("All containers cleaned up")

    def _remove_container(self, container):
        try:
            container.remove(force=True)
            logger.info("Container %s removed", container.id)
            tmpfs_path = self.temp_dir_dict.pop(container.id, None)
            if tmpfs_path:
                self._cleanup_tmpfs(tmpfs_path)
        except Exception as e:
            logger.error("Error removing container %s: %s", container.id, e, exc_info=True)

    def _cleanup_tmpfs(self, tmpfs_path: str):
        try:
            shutil.rmtree(tmpfs_path, ignore_errors=True)
            logger.info("Temporary subdir %s removed", tmpfs_path)
        except Exception as e:
            logger.error("Failed to remove tmpfs subdir %s: %s", tmpfs_path, e, exc_info=True)
