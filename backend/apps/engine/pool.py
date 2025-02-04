import tempfile
import os
from queue import Queue
from threading import Lock
import docker
import logging
import json
import asyncio
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)

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
            logger.info("New container created with tmpfs mounted")
            self.pool.put(container)

    def _create_tmpfs(self):
        tmpfs_path = tempfile.mkdtemp(prefix="container_tmpfs_")
        with self.lock:
            os.system(f"mount -t tmpfs -o size=64m tmpfs {tmpfs_path}")
        logger.info(f"Temporary filesystem created at {tmpfs_path}")
        return tmpfs_path

    def _create_container(self, tmpfs_path):
        try:
            container = self.client.containers.run(
                'code-sandbox',
                detach=True,
                network='backend',
                mem_limit='256m',
                read_only=True,
                tmpfs={'/tmp': 'rw,noexec,nosuid,size=64M'},
                volumes={tmpfs_path: {'bind': '/host_tmpfs', 'mode': 'ro'}}
            )
            return container
        except Exception as e:
            logger.error(f"Failed to create container: {e}")
            self._cleanup_tmpfs(tmpfs_path)
            raise

    async def acquire_container_async(self):
        def _acquire():
            with self.lock:
                container = self.pool.get(block=True, timeout=30)
                self._active_containers.add(container.id)
                temp_dir = self.temp_dir_dict[container.id]
                logger.info(f"Container {container.id} acquired")
                return container, temp_dir


        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(self._executor, _acquire)

    def acquire_container(self):
        """Synchronous version maintained for backward compatibility"""
        with self.lock:
            container = self.pool.get(block=True, timeout=30)
            self._active_containers.add(container.id)
            temp_dir = self.temp_dir_dict[container.id]
            logger.info(f"Container {container.id} acquired")
            return container, temp_dir

    def release_container(self, container):
        try:
            temp_dir = self.temp_dir_dict[container.id]
            self._clear_tmpfs(temp_dir)
            with self.lock:
                self._active_containers.remove(container.id)
                self.pool.put(container)
            logger.info(f"Container {container.id} released and tmpfs cleared")
        except Exception as e:
            logger.error(f"Failed to release container {container.id}: {e}")
            self._replace_container(container)

    def _clear_tmpfs(self, tmpfs_path):
        try:
            for filename in os.listdir(tmpfs_path):
                file_path = os.path.join(tmpfs_path, filename)
                if os.path.isfile(file_path) or os.path.islink(file_path):
                    os.unlink(file_path)
                elif os.path.isdir(file_path):
                    os.rmdir(file_path)
            logger.info(f"Cleared contents of tmpfs at {tmpfs_path}")
        except Exception as e:
            logger.error(f"Failed to clear tmpfs at {tmpfs_path}: {e}")

    def _replace_container(self, container):
        try:
            container.remove(force=True)
            logger.info(f"Container {container.id} removed")
        except docker.errors.NotFound:
            logger.warning(f"Container {container.id} not found during removal")
        except Exception as e:
            logger.error(f"Failed to remove container {container.id}: {e}")

        tmpfs_path = self.temp_dir_dict.pop(container.id, None)
        if tmpfs_path:
            self._cleanup_tmpfs(tmpfs_path)

        new_tmpfs_path = self._create_tmpfs()
        new_container = self._create_container(new_tmpfs_path)
        self.temp_dir_dict[new_container.id] = new_tmpfs_path

        with self.lock:
            self.pool.put(new_container)
        logger.info(f"Container {new_container.id} replaced with new tmpfs")

    def cleanup_all_containers(self):
        logger.info("Cleaning up all containers...")
        with self.lock:
            while not self.pool.empty():
                try:
                    container = self.pool.get_nowait()
                    self._remove_container(container)
                except Exception as e:
                    logger.error(f"Error removing container from pool: {e}")

            for container_id in list(self._active_containers):
                try:
                    container = self.client.containers.get(container_id)
                    self._remove_container(container)
                except Exception as e:
                    logger.error(f"Error removing active container {container_id}: {e}")

            self._active_containers.clear()
        logger.info("All containers and tmpfs mounts cleaned up")

    def _remove_container(self, container):
        try:
            container.remove(force=True)
            logger.info(f"Container {container.id} removed")
            tmpfs_path = self.temp_dir_dict.pop(container.id, None)
            if tmpfs_path:
                self._cleanup_tmpfs(tmpfs_path)
        except Exception as e:
            logger.error(f"Error removing container {container.id}: {e}")

    def _cleanup_tmpfs(self, tmpfs_path):
        try:
            os.system(f"umount {tmpfs_path}")
            os.rmdir(tmpfs_path)
            logger.info(f"Temporary filesystem at {tmpfs_path} unmounted and removed")
        except Exception as e:
            logger.error(f"Failed to clean up tmpfs at {tmpfs_path}: {e}")