from celery import shared_task
import logging
import ast
from django.conf import settings
import inspect
import pandas as pd
import requests
import random
import docker
from requests.exceptions import RequestException
import json
import redis
import time
import uuid
from django.conf import settings
from celery.result import AsyncResult

logger = logging.getLogger(__name__)

# DANGEROUS_ATTRIBUTES = {
#     '__class__', '__subclasses__', '__globals__', '__builtins__',
#     '__getattribute__', '__getattr__', '__dict__', '__bases__', 
#     '__mro__', '__reduce__', '__reduce_ex__', '__subclasshook__'
# }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 




# MODULE_BLOCKLIST = {'os', 'sys', 'subprocess', 'ctypes', 'socket', 'inspect'}
# WRAPPER_ATTRIBUTES = {'_wrapped_object', '_safe_getattr'}

# Redis keys
REDIS_QUEUE_KEY = 'code_execution_queue'
REDIS_RESULT_KEY_PREFIX = 'code_result:'

# class SecurityVisitor(ast.NodeVisitor):
#     def visit_Call(self, node):
#         if isinstance(node.func, ast.Name) and node.func.id == 'getattr':
#             if len(node.args) >= 2 and isinstance(node.args[1], ast.Str):
#                 attr_name = node.args[1].s
#                 if attr_name in DANGEROUS_ATTRIBUTES:
#                     raise ValueError(f"Dangerous getattr access: {attr_name}")
#         self.generic_visit(node)

#     def visit_Attribute(self, node):
#         if node.attr in DANGEROUS_ATTRIBUTES:
#             raise ValueError(f"Dangerous attribute access: {node.attr}")
#         self.generic_visit(node)

# class SafeObject:
#     __slots__ = ('_wrapped_object', '_safe_getattr')

#     def __init__(self, obj, safe_getattr=None):
#         self._wrapped_object = obj
#         self._safe_getattr = safe_getattr or self._default_getattr
#         logger.debug(f"Initialized SafeObject with wrapped object: {type(obj)}")

#     def _default_getattr(self, name):
#         if name in DANGEROUS_ATTRIBUTES:
#             raise AttributeError(f"Access to {name} is prohibited")
#         logger.debug(f"Accessing attribute: {name} on {type(self._wrapped_object)}")
#         return getattr(self._wrapped_object, name)

#     def __getattr__(self, name):
#         if name in WRAPPER_ATTRIBUTES:
#             return object.__getattribute__(self, name)
#         logger.debug(f"Getting attribute: {name} from {type(self._wrapped_object)}")
#         return self._wrap(self._safe_getattr(name))

#     def __dir__(self):
#         return [a for a in dir(self._wrapped_object) if a not in DANGEROUS_ATTRIBUTES]

#     def _wrap(self, value):
#         """Wrap values in appropriate safe containers."""
#         logger.debug(f"Wrapping value: {value} of type: {type(value)}")
#         if inspect.ismodule(value):
#             logger.debug(f"Wrapping module: {value}")
#             return SafeModule(value)
#         # Check for DataFrame before general type/class checks
#         if isinstance(value, pd.DataFrame):
#             logger.debug(f"Wrapping DataFrame: {value}")
#             return SafeDataFrame(value)
#         if isinstance(value, type) or (hasattr(value, '__class__') and isinstance(value.__class__, type)):
#             logger.debug(f"Wrapping class: {value}")
#             return SafeCallable(value)
#         if inspect.ismethod(value) or inspect.isfunction(value):
#             logger.debug(f"Wrapping callable: {value}")
#             return SafeCallable(value)
#         if isinstance(value, (list, dict, set, tuple)):
#             logger.debug(f"Wrapping container: {value}")
#             return SafeContainer(value)
#         if hasattr(value, '__dict__'):
#             logger.debug(f"Wrapping object with __dict__: {value}")
#             return SafeObject(value)
#         logger.debug(f"Returning unwrapped value: {value}")
#         return value

# class SafeCallable(SafeObject):
#     def __call__(self, *args, **kwargs):
#         logger.debug(f"Calling SafeCallable with args: {args}, kwargs: {kwargs}")
#         result = self._wrapped_object(*args, **kwargs)
#         logger.debug(f"Call result: {result}")
#         return self._wrap(result)


# class SafeContainer(SafeObject):
#     def __iter__(self):
#         for item in self._wrapped_object:
#             yield self._wrap(item)

#     def __getitem__(self, key):
#         return self._wrap(self._wrapped_object[key])


# class SafeModule(SafeObject):
#     def __getattr__(self, name):
#         if name in DANGEROUS_ATTRIBUTES:
#             raise AttributeError(f"Module attribute {name} blocked")
#         logger.debug(f"Accessing module attribute: {name}")
#         return self._wrap(getattr(self._wrapped_object, name))


# class SafeDataFrame(SafeObject):
#     def __getitem__(self, key):
#         return self._wrap(self._wrapped_object[key])

#     def __setitem__(self, key, value):
#         self._wrapped_object[key] = self._wrap(value)

#     def __getattr__(self, name):
#         if name in DANGEROUS_ATTRIBUTES:
#             raise AttributeError(f"DataFrame attribute {name} blocked")
#         logger.debug(f"Accessing DataFrame attribute: {name}")
#         return self._wrap(getattr(self._wrapped_object, name))
    
#     def __str__(self):
#         return str(self._wrapped_object)

#     def __repr__(self):
#         return repr(self._wrapped_object)

# def create_safe_environment():
#     print_collector = []

#     def safe_print(*args, **kwargs):
#         sep = kwargs.get('sep', ' ')
#         end = kwargs.get('end', '\n')
        
#         # Unwrap SafeObject instances before printing
#         unwrapped_args = []
#         for arg in args:
#             if isinstance(arg, SafeObject):
#                 logger.debug(f"Unwrapping SafeObject: {arg}, wrapped object: {arg._wrapped_object}")
#                 unwrapped_args.append(arg._wrapped_object)
#             else:
#                 unwrapped_args.append(arg)
        
#         # Convert unwrapped arguments to strings
#         output = sep.join(str(arg) for arg in unwrapped_args) + end
#         print_collector.append(output)
#         logger.debug(f"Printed output: {output}")

#     safe_builtins = {
#         'None': None,
#         'bool': SafeCallable(bool),
#         'int': SafeCallable(int),
#         'float': SafeCallable(float),
#         'str': SafeCallable(str),
#         'list': SafeCallable(list),
#         'dict': SafeCallable(dict),
#         'tuple': SafeCallable(tuple),
#         'set': SafeCallable(set),
#         'len': SafeCallable(len),
#         'range': SafeCallable(range),
#         'sum': SafeCallable(sum),
#         'min': SafeCallable(min),
#         'max': SafeCallable(max),
#         'abs': SafeCallable(abs),
#         'round': SafeCallable(round),
#         'zip': SafeCallable(zip),
#         'print': SafeCallable(safe_print),
#         '__import__': SafeCallable(
#             lambda name, *args, **kwargs: SafeModule(__import__(name, *args, **kwargs))
#             if name not in MODULE_BLOCKLIST else None
#         )
#     }

#     allowed_modules = set(getattr(settings, 'ALLOWED_MODULES', [])) - MODULE_BLOCKLIST
#     for mod_name in allowed_modules:
#         try:
#             safe_builtins[mod_name] = SafeModule(__import__(mod_name))
#         except ImportError:
#             continue

#     safe_builtins['pd'] = SafeModule(pd)
#     safe_builtins['numpy'] = SafeModule(__import__('numpy'))

#     return {
#         '__builtins__': safe_builtins,
#         'print_collector': print_collector,
#         'getattr': SafeCallable(
#             lambda obj, name, default=None: SafeObject(getattr(obj, name, default))
#             if name not in DANGEROUS_ATTRIBUTES else None
#         )
#     }

@shared_task(bind=True)
def execute_code(self, code_string):
    """
    Celery task that submits code to sandbox and returns immediately.
    The task_id is Celery's auto-generated ID.
    """
    try:
        logger.debug(f"Starting code execution in sandbox for task {self.request.id}")
        
        # Connect to Redis
        redis_client = redis.Redis(
            host='redis',
            port=6379,
            db=0,
            socket_timeout=5,
            retry_on_timeout=True
        )
        
        # Push task to queue with Celery's task_id
        task_data = {
            'code': code_string,
            'task_id': self.request.id  # Use Celery's task_id
        }
        
        redis_client.lpush(REDIS_QUEUE_KEY, json.dumps(task_data))
        logger.debug(f"Task {self.request.id} pushed to queue")
        
        # Return immediately with task ID
        return {
            'status': 'pending',
            'task_id': self.request.id
        }
            
    except redis.RedisError as e:
        logger.error(f"Redis error: {str(e)}")
        return {
            'status': 'error',
            'error': f"Redis error: {str(e)}"
        }
        
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        return {
            'status': 'error',
            'error': f"Unexpected error: {str(e)}"
        }

@shared_task(bind=True)
def get_execution_result(self, task_id):
    """
    Task to check execution result from Redis
    """
    try:
        redis_client = redis.Redis(
            host='redis',
            port=6379,
            db=0,
            socket_timeout=5,
            retry_on_timeout=True
        )
        
        result_key = f"{REDIS_RESULT_KEY_PREFIX}{task_id}"
        result_data = redis_client.get(result_key)
        
        if result_data:
            result = json.loads(result_data)
            return {
                'status': 'completed',
                'success': result['success'],
                'result': result.get('result', ''),
                'error': result.get('error')
            }
        
        return {
            'status': 'pending',
            'task_id': task_id
        }
        
    except Exception as e:
        logger.error(f"Error checking result: {str(e)}")
        return {
            'status': 'error',
            'error': str(e)
        }