import requests
import sys
import os

def check_health():
    try:
        port = os.getenv("COMPLIANCE_PORT", 8003)
        response = requests.get(f"http://localhost:{port}/health", timeout=5)
        if response.status_code == 200:
            return True
    except Exception:
        pass
    return False

if __name__ == "__main__":
    if check_health():
        sys.exit(0)
    else:
        sys.exit(1)