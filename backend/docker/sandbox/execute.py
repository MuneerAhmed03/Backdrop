import os
import sys
import pickle
import pandas as pd
import numpy as np
import logging
import ast
import json
from datetime import datetime
from strategy import BaseStrategy,StrategyResult,Trade

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
    ]
)

logger = logging.getLogger(__name__)

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
        
        code_path = '/host_tmpfs/code.py'  
        data_path = '/host_tmpfs/data.pkl'  

        if not os.path.exists(code_path):
            logger.error(f"Code file not found: {code_path}")
            sys.exit(2)
        if not os.path.exists(data_path):
            logger.error(f"Data file not found: {data_path}")
            sys.exit(2)

        with open(code_path, 'r') as code_file:
            code = code_file.read()
            logger.info(f"Successfully read code from {code_path}")

        with open(data_path, 'rb') as data_file:
            df = pickle.load(data_file) 
            logger.info(f"Successfully read data from {data_path}")

        return code, df
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
    try:
        logger.info("Starting execution of backtest code")
        code, df = load_data()

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
        
        UserStrategy = type(
            "UserStrategy",
            (BaseStrategy,),
            {"generate_signals": local_env['generate_signals']}
        )

        logger.info("Initializing user strategy with provided data")
        strategy = UserStrategy(df)
        logger.info("Running backtest")
        try:
            results = strategy.run_backtest()
        except AttributeError:
            logger.error("Strategy does not have a 'run_backtest' method.")
            sys.exit(69)

        if isinstance(results, pd.DataFrame):
            result_json = results.to_json(orient="records")
        elif isinstance(results, StrategyResult):
            result_json = json.dumps(results.__dict__, cls=StrategyResultEncoder, indent=4)
        else:
            result_json = json.dumps(results)
        
        sys.stdout.write(result_json)
        sys.stdout.flush()
    except Exception as e:
        logger.error(f"Execution error: {str(e)}")
        sys.exit(1)