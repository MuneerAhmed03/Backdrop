from celery import shared_task
import logging
import ast
from django.conf import settings
from types import ModuleType, MethodType
import inspect
import pandas as pd  

logger = logging.getLogger(__name__)

DANGEROUS_ATTRIBUTES = {
    '__class__', '__subclasses__', '__globals__', '__builtins__',
    '__getattribute__', '__getattr__', '__dict__', '__bases__', 
    '__mro__', '__reduce__', '__reduce_ex__', '__subclasshook__'
}

MODULE_BLOCKLIST = {'os', 'sys', 'subprocess', 'ctypes', 'socket', 'inspect'}
WRAPPER_ATTRIBUTES = {'_wrapped_object', '_safe_getattr'}

class SecurityVisitor(ast.NodeVisitor):
    def __init__(self):
        self.getattr_calls = []

    def visit_Call(self, node):
        # Detect getattr() calls with dangerous arguments
        if isinstance(node.func, ast.Name) and node.func.id == 'getattr':
            if len(node.args) >= 2 and isinstance(node.args[1], ast.Str):
                attr_name = node.args[1].s
                if attr_name in DANGEROUS_ATTRIBUTES:
                    raise ValueError(f"Dangerous getattr access: {attr_name}")
        
        self.generic_visit(node)

    def visit_Attribute(self, node):
        if node.attr in DANGEROUS_ATTRIBUTES:
            raise ValueError(f"Dangerous attribute access: {node.attr}")
        self.generic_visit(node)

class SafeObject:
    __slots__ = ('_wrapped_object', '_safe_getattr')
    
    def __init__(self, obj, safe_getattr=None):
        self._wrapped_object = obj
        self._safe_getattr = safe_getattr or self._default_getattr

    def _default_getattr(self, name):
        if name in DANGEROUS_ATTRIBUTES:
            raise AttributeError(f"Access to {name} is prohibited")
        return getattr(self._wrapped_object, name)

    def __getattr__(self, name):
        if name in WRAPPER_ATTRIBUTES:
            return object.__getattribute__(self, name)
        return self._wrap(self._safe_getattr(name))

    def __dir__(self):
        return [a for a in dir(self._wrapped_object) 
                if a not in DANGEROUS_ATTRIBUTES]

    def _wrap(self, value):
        if inspect.ismodule(value) or inspect.isclass(value):
            return SafeModule(value)
        if inspect.ismethod(value) or inspect.isfunction(value):
            return SafeCallable(value)
        if isinstance(value, (list, dict, set, tuple)):
            return SafeContainer(value)
        if isinstance(value, pd.DataFrame):
            return SafeDataFrame(value)
        return SafeObject(value) if hasattr(value, '__dict__') else value

class SafeCallable(SafeObject):
    def __call__(self, *args, **kwargs):
        result = self._wrapped_object(*args, **kwargs)
        return self._wrap(result)

class SafeContainer(SafeObject):
    def __iter__(self):
        for item in self._wrapped_object:
            yield self._wrap(item)

    def __getitem__(self, key):
        return self._wrap(self._wrapped_object[key])

class SafeModule(SafeObject):
    def __getattr__(self, name):
        if name in DANGEROUS_ATTRIBUTES:
            raise AttributeError(f"Module attribute {name} blocked")
        return self._wrap(getattr(self._wrapped_object, name))

class SafeDataFrame(SafeObject):
    """Wrapper for Pandas DataFrame to allow safe operations"""
    def __getitem__(self, key):
        return self._wrap(self._wrapped_object[key])

    def __setitem__(self, key, value):
        self._wrapped_object[key] = self._wrap(value)

    def __getattr__(self, name):
        if name in DANGEROUS_ATTRIBUTES:
            raise AttributeError(f"DataFrame attribute {name} blocked")
        return self._wrap(getattr(self._wrapped_object, name))

def create_safe_environment():
    """Create a restricted execution environment with deep security wrapping"""
    print_collector = []
    
    safe_builtins = {
        'None': None,
        'bool': SafeObject(bool),
        'int': SafeObject(int),
        'float': SafeObject(float),
        'str': SafeObject(str),
        'list': SafeObject(list),
        'dict': SafeObject(dict),
        'tuple': SafeObject(tuple),
        'set': SafeObject(set),
        'len': SafeCallable(len),
        'range': SafeCallable(range),
        'sum': SafeCallable(sum),
        'min': SafeCallable(min),
        'max': SafeCallable(max),
        'abs': SafeCallable(abs),
        'round': SafeCallable(round),
        'zip': SafeCallable(zip),
        'print': SafeCallable(lambda *args: print_collector.append(
            ' '.join(str(SafeObject(a)._wrapped_object) for a in args)
        )),
        '__import__': SafeCallable(lambda name: SafeModule(__import__(name)) 
                                 if name not in MODULE_BLOCKLIST 
                                 else None)
    }

    allowed_modules = set(getattr(settings, 'ALLOWED_MODULES', [])) - MODULE_BLOCKLIST
    for mod_name in allowed_modules:
        try:
            raw_mod = __import__(mod_name)
            safe_builtins[mod_name] = SafeModule(raw_mod)
        except ImportError:
            continue

    safe_builtins['pd'] = SafeModule(pd)  
    safe_builtins['numpy'] = SafeModule(__import__('numpy'))

    return {
        '__builtins__': safe_builtins,
        'print_collector': print_collector,
        'getattr': SafeCallable(
            lambda obj, name, default=None: SafeObject(getattr(obj, name, default))
            if name not in DANGEROUS_ATTRIBUTES else None
        )
    }

@shared_task
def execute_code(code_string):
    """Execute user code with multiple security layers"""
    try:
        # Static analysis with enhanced checks
        tree = ast.parse(code_string)
        SecurityVisitor().visit(tree)

        # Prepare environment
        safe_globals = create_safe_environment()
        safe_locals = {'result': None}

        # Compile and execute with wrapped environment
        compiled = compile(code_string, '<user_code>', 'exec')
        exec(compiled, safe_globals, safe_locals)

        return {
            'success': True,
            'result': str(safe_globals['print_collector'][-1]) 
                     if safe_globals['print_collector'] else None,
            'printed_output': '\n'.join(safe_globals['print_collector'])
        }

    except Exception as e:
        logger.error(f"Execution blocked: {str(e)}")
        return {
            'success': False,
            'error': str(e),
            'printed_output': '\n'.join(safe_globals.get('print_collector', []))
        }