import urllib.request

url = 'https://weaviate-production-a833.up.railway.app/v1/schema/DocumentChunk'
req = urllib.request.Request(url, method='DELETE')
try:
    with urllib.request.urlopen(req) as resp:
        print("Successfully deleted the DocumentChunk class from Production Weaviate.")
except urllib.error.HTTPError as e:
    if e.code == 400:
        print("Class does not exist or already deleted.")
    else:
        print("Error:", e.read().decode())
except Exception as e:
    print('Error:', e)
