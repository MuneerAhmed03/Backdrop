import os
import sys

if __name__ == "__main__":
    try:
        exec(os.environ['USER_CODE'])
    except Exception as e:
        print(f"error: {str(e)}", file=sys.stderr)
        sys.exit(1)