import docker
from queue import Queue
import threading
import time


class ContainerPool:
    def __init__(self):
        self.client = docker.from_env() 
        self.pool = Queue(maxsize=2)
        self.lock = threading.Lock()
        self._init_pool()

    def _init_pool(self):
        for _ in range(2):
            container = self.client.containers.run(
                'code-sandbox',
                detach=True,
                network='backend',
                mem_limit='256m',
                read_only=True,
                tmpfs={'/tmp':'rw,noexec,nosuid,size=64M'}
            )
            self.pool.put(container)
    
    def acquire_container(self):
        with self.lock:
            return self.pool.get(block=True, timeout=30)
        
    def release_container(self, container):
        try:
            container.exec_run('find /temp -mindepth 1 -delete', privileged=False)
            with self.lock:
                self.pool.put(container)
        except:
            self._replace_container(container)

    def _replace_container(self, container):
        try:
            container.remove(force=True)
        except docker.errors.NotFound:
            pass
        new_container = self.client.containers.run(
                'code-sandbox',
                detach=True,
                network='backend',
                mem_limit='256m',
                read_only=True,
                tmpfs={'/tmp':'rw,noexec,nosuid,size=64M'}
            )
        with self.lock:
            self.pool.put(new_container) 