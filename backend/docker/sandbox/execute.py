import os
import sys
import pickle
import pandas as pd
import numpy as np
import logging
import ast
import json
from datetime import datetime
from strategy import BaseStrategy, Trade
import warnings
import inspect

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(sys.stderr),
    ]
)

HOST_TMPFS_BIND = os.environ.get("HOST_TMPFS_BIND", "/host_tmpfs")

logger = logging.getLogger(__name__)
logger.propagate = False;

def _format_dir_listing(path: str) -> str:
    try:
        entries = []
        with os.scandir(path) as it:
            for e in it:
                try:
                    st = e.stat()
                    size = st.st_size if e.is_file() else "-"
                    kind = "DIR" if e.is_dir() else ("LNK" if e.is_symlink() else "FILE")
                    entries.append(f"{kind:4} {size:>10}  {e.name}")
                except Exception as ie:
                    entries.append(f"????          ?  {e.name}  (stat error: {ie})")
        if not entries:
            return f"(empty) {path}"
        entries.sort()
        return "\n".join(entries)
    except Exception as e:
        return f"(failed to list {path}: {e})"

def warning_handler(message, category, filename, lineno, file=None, line=None):
    stderr_messages.append(f"{category.__name__}: {message}")

warnings.showwarning = warning_handler

class SafeCodeVisitor(ast.NodeVisitor):
    def visit_Import(self, node):
        raise ValueError("Import statements are not allowed")
    def visit_ImportFrom(self, node):
        raise ValueError("Import statements are not allowed")
    def visit_Call(self, node):
        if isinstance(node.func, ast.Name) and node.func.id in {"exec", "eval", "open"}:
            raise ValueError(f"Call to '{node.func.id}' is not allowed")
        self.generic_visit(node) 

def validate_user_code(code):
    tree = ast.parse(code)
    SafeCodeVisitor().visit(tree)

def load_data():
    try:
        logger.error("HOST_TMPFS_BIND=%s", HOST_TMPFS_BIND)
        listing = _format_dir_listing(HOST_TMPFS_BIND)
        logger.error("Container sees contents of %s:\n%s", HOST_TMPFS_BIND, listing)
    except Exception as e:
        logger.error("Could not list %s at startup: %s", HOST_TMPFS_BIND, e)

    code_path = '/host_tmpfs/code.py'
    data_path = '/host_tmpfs/data.pkl'
    config_path = '/host_tmpfs/config.txt'

    try:
        for path, file_type in [(code_path, "Code"), (data_path, "Data"), (config_path, "Config")]:
            if not os.path.exists(path):
                error_msg = f"{file_type} file not found: {path}"
                logger.error(error_msg)
                raise FileNotFoundError(error_msg)
        try:
            with open(code_path, 'r') as code_file:
                code = code_file.read()
                logger.info(f"Successfully read code from {code_path}")
        except Exception as e:
            error_msg = f"Failed to read code file: {str(e)}"
            logger.error(error_msg)
            raise RuntimeError(error_msg) from e

        try:
            with open(data_path, 'rb') as data_file:
                df = pickle.load(data_file)
                logger.info(f"Successfully read data from {data_path}")
        except Exception as e:
            error_msg = f"Failed to read or deserialize data file: {str(e)}"
            logger.error(error_msg)
            raise RuntimeError(error_msg) from e

        try:
            config = {}
            with open(config_path, 'r') as config_file:
                for line in config_file:
                    key, value = line.strip().split('=')
                    config[key] = float(value)
            logger.info(f"Successfully read config from {config_path}")
        except Exception as e:
            error_msg = f"Failed to read or parse config file: {str(e)}"
            logger.error(error_msg)
            raise RuntimeError(error_msg) from e

        return code, df, config

    except Exception as e:
        logger.error(f"Data loading error: {str(e)}")
        sys.exit(2)

class StrategyResultEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.int64): 
            return int(obj)
        if isinstance(obj, np.float64):
            return float(obj)
        if isinstance(obj, pd.Series):  
            return obj.tolist()
        if isinstance(obj, datetime):  
            return obj.isoformat()
        if isinstance(obj, Trade):  
            return obj.__dict__
        return super().default(obj)

if __name__ == "__main__":
    stderr_messages = []  
    try:
        logger.info("Starting execution of backtest code")
        code, df, config = load_data()

        try:
            validate_user_code(code)
        except ValueError as e:
            print(f"Invalid user code: {e}")
            raise
        
        local_env = {
            "pd": pd, 
            "np": np  
        }   

        logger.info("Executing user-provided code")
        exec(code,None, local_env)
        
        if 'generate_signals' not in local_env or not callable(local_env['generate_signals']):
            raise ValueError("No valid 'generate_signals' function defined")
        
        user_fn = local_env['generate_signals']
        sig = inspect.signature(user_fn)    
        
        if len(sig.parameters) == 1:
            logger.error("User function takes data")
            def _generate_signals(self):
                return user_fn(self.data)
        else:
            logger.error("User function takes self")
            def _generate_signals(self):
                return user_fn(self)
        
        UserStrategy = type(
            "UserStrategy",
            (BaseStrategy,),
            {"generate_signals": local_env['generate_signals']}
        )

        logger.info("Initializing user strategy with provided data")
        try: 
            loss_cutting_strategy = UserStrategy(
                df.copy(),
                initial_capital=config['initialCapital'],
                investment_per_trade=config['investmentPerTrade'],
                trading_method=0
            )
            # risk_reduction_strategy = UserStrategy(
            #     df.copy(),
            #     trading_method=1
            # )
            logger.info(f"Has run_backtest? {'run_backtest' in dir(loss_cutting_strategy)}")
            
            
            # logger.info(f"Has run_backtest? {'run_backtest' in dir(risk_reduction_strategy)}")

        except Exception as e:
            logger.error(f"Failed to initialize strategy: {str(e)}")
            raise

        logger.info("Running backtest")
        try:
            logger.info("About to run backtest for loss cutting strategy")
            loss_cutting_results = loss_cutting_strategy.run_backtest()
            logger.info("Loss cutting backtest completed")
            
            logger.info("About to run backtest for risk reduction strategy")
            # risk_reduction_results = risk_reduction_strategy.run_backtest()
            logger.info("Risk reduction backtest completed")
            
            logger.info("Backtest completed successfully")
            
            
            output = {
                "results": {
                    "loss_cutting": loss_cutting_results.__dict__,
                },
                "warnings": stderr_messages if stderr_messages else None
            }
            # "risk_reduction": risk_reduction_results.__dict__
            result_json = json.dumps(output, cls=StrategyResultEncoder, indent=4)
            sys.stdout.write(result_json)
            sys.stdout.flush()

        except AttributeError as e:
            logger.error(f"Strategy does not have a 'run_backtest' method. Error: {str(e)}")
            logger.error(f"Available methods: {dir(loss_cutting_strategy)}")
            error_output = {
                "error": str(e),
                "warnings": stderr_messages if stderr_messages else None
            }
            sys.stdout.write(json.dumps(error_output))
            sys.stdout.flush()
            sys.exit(69)

    except Exception as e:
        logger.error(f"Execution error: {str(e)}")
        error_output = {
             "error": str(e),
            "warnings": stderr_messages if stderr_messages else None
        }
        sys.stdout.write(json.dumps(error_output))
        sys.stdout.flush()
        sys.exit(1)
