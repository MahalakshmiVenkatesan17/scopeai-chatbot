import weaviate
from app.services.weaviate_service import WeaviateService
from app.core.config import settings
import logging

logging.getLogger("weaviate").setLevel(logging.WARNING)

def check_local():
    print(f"\n--- LOCAL WEAVIATE ({settings.WEAVIATE_URL}) ---")
    try:
        svc = WeaviateService.get_instance()
        client = svc._get_client()
        collections = client.collections.list_all()
        for name in collections:
            col = client.collections.get(name)
            count = col.aggregate.over_all(total_count=True).total_count
            print(f"- {name}: {count} objects")
    except Exception as e:
        print(f"Error checking local: {e}")

def check_railway():
    RAILWAY_URL = "https://weaviate-production-a833.up.railway.app"
    print(f"\n--- RAILWAY WEAVIATE ({RAILWAY_URL}) ---")
    try:
        client = weaviate.connect_to_custom(
            http_host=RAILWAY_URL.split("//")[-1],
            http_port=443,
            http_secure=True
        )
        collections = client.collections.list_all()
        for name in collections:
            col = client.collections.get(name)
            count = col.aggregate.over_all(total_count=True).total_count
            print(f"- {name}: {count} objects")
            if count > 0:
                res = col.query.fetch_objects(limit=1)
                print(f"  Example: {res.objects[0].properties.get('content', '')[:100]}...")
        client.close()
    except Exception as e:
        print(f"Error checking railway: {e}")

if __name__ == "__main__":
    check_local()
    check_railway()
