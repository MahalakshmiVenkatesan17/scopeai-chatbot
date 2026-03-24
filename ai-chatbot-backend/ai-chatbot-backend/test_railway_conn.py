import urllib.request
import urllib.error
import time

WEAVIATE_URL = "https://weaviate-production-a833.up.railway.app"
API_KEY = None # Set this if your Railway Weaviate has an API key

def test_connection():
    ready_url = f"{WEAVIATE_URL.rstrip('/')}/v1/.well-known/ready"
    print(f"Testing Weaviate Readiness at: {ready_url}")
    
    start = time.time()
    try:
        req = urllib.request.Request(ready_url, method="GET")
        if API_KEY:
            req.add_header("Authorization", f"Bearer {API_KEY}")
            
        with urllib.request.urlopen(req, timeout=10) as resp:
            is_ready = resp.status == 200
            
        duration = int((time.time() - start) * 1000)
        if is_ready:
            print(f"✅ SUCCESS: Weaviate is healthy! (Response: {duration}ms)")
        else:
            print(f"❌ FAILED: Weaviate returned status {resp.status}")
    except urllib.error.HTTPError as e:
        print(f"❌ HTTP ERROR: {e.code} {e.reason}")
    except Exception as e:
        print(f"❌ CONNECTION ERROR: {str(e)}")

if __name__ == "__main__":
    test_connection()
