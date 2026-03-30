import urllib.request
import json

url = 'https://weaviate-production-a833.up.railway.app/v1/objects?class=DocumentChunk&limit=5'
req = urllib.request.Request(url, method='GET')
try:
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        objects = data.get('objects', [])
        print(f"Total returned: {len(objects)}")
        for obj in objects:
            props = obj.get('properties', {})
            print(f"ID: {obj.get('id')}")
            print(f"  DocTitle: {props.get('documentTitle')}")
            print(f"  DocFilename: {props.get('documentFilename')}")
            print(f"  Doc ID: {props.get('documentId')}")
            print(f"  Content: {props.get('content', '')[:60]}...")
except Exception as e:
    print('Error:', e)
