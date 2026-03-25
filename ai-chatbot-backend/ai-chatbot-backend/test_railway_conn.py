import urllib.request
import urllib.error
import time
import json

WEAVIATE_URL = "https://weaviate-production-a833.up.railway.app"
API_KEY = None # Set this if your Railway Weaviate has an API key

def check_railway():
    # 1. Health check
    ready_url = f"{WEAVIATE_URL.rstrip('/')}/v1/.well-known/ready"
    print(f"Testing Weaviate Readiness at: {ready_url}")
    
    try:
        req = urllib.request.Request(ready_url, method="GET")
        with urllib.request.urlopen(req, timeout=10) as resp:
            if resp.status == 200:
                print("✅ Railway Weaviate is READE!")
            else:
                print(f"❌ Railway Weaviate returned status {resp.status}")
                return
    except Exception as e:
        print(f"❌ CONNECTION ERROR (Health): {str(e)}")
        return

    # 2. Count objects in DocumentChunk
    count_url = f"{WEAVIATE_URL.rstrip('/')}/v1/objects?limit=0" # A simple way to get some meta or just query
    # Better: use the graphql endpoint via REST if we don't have the client
    # Or just fetch a small list
    list_url = f"{WEAVIATE_URL.rstrip('/')}/v1/objects?limit=5"
    
    try:
        req = urllib.request.Request(list_url, method="GET")
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
            total = data.get("deprecations", []) # Not very useful
            objects = data.get("objects", [])
            print(f"Found {len(objects)} objects (first page limit 5) on Railway.")
            
            for i, obj in enumerate(objects):
                props = obj.get("properties", {})
                content = props.get("content", "No content")
                doc_id = props.get("documentId", "No docId")
                print(f"  [{i}] Doc:{doc_id} | {content[:100]}...")
                
    except Exception as e:
        print(f"❌ ERROR (Objects): {str(e)}")

if __name__ == "__main__":
    check_railway()
