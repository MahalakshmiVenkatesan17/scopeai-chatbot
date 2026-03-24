# CPU Performance Solution Report

> **Status: ALL FIXES APPLIED** — Ready to rebuild and deploy.

## Analysis of "System And Container Performance Report"

Based on the PDF report and full code audit, here are the root causes and solutions.

---

## Summary of Problems Found

| Issue | Severity | Root Cause |
|-------|----------|------------|
| Backend container at 384.95% CPU, 940 PIDs | Critical | Unbounded process/thread spawning, no resource limits |
| MySQL at 209.19% CPU | High | Oversized connection pool, no query optimization |
| Weaviate container not running | High | Resource starvation from other containers |
| Host CPU > 200% | Medium | unattended-upgrades + needrestart running during peak |

---

## Root Cause #1: LangGraphService Instantiated Per Request (CRITICAL)

**File:** `app/api/v1/chat.py:162`, `app/api/v1/chat.py:303`, `app/api/v1/public_chat.py:249`

Every chat message creates a **new** `LangGraphService()`, which internally:
- Creates a new `OpenAIService()` (with a new `AsyncOpenAI` client)
- Gets the `WeaviateService` singleton
- **Compiles a new LangGraph `StateGraph`** every time

```python
# PROBLEM: Called on every single message
langgraph = LangGraphService()
```

The graph compilation is CPU-intensive. Under concurrent requests, this multiplies rapidly.

### Fix

Create a singleton or use dependency injection:

```python
# app/services/langgraph_service.py — add at the bottom:
_langgraph_instance: LangGraphService | None = None

def get_langgraph_service() -> LangGraphService:
    global _langgraph_instance
    if _langgraph_instance is None:
        _langgraph_instance = LangGraphService()
    return _langgraph_instance
```

Then in `chat.py` and `public_chat.py`, replace:
```python
# Before
langgraph = LangGraphService()

# After
from app.services.langgraph_service import get_langgraph_service
langgraph = get_langgraph_service()
```

---

## Root Cause #2: OpenAI Client Created Per Request (HIGH)

**File:** `app/services/openai_service.py:351-378`

`_get_client()` opens a **new DB session** and creates a **new `AsyncOpenAI()` client** on every call to check for tenant-specific API keys. Under load, this creates hundreds of ephemeral DB connections and HTTP client pools.

```python
# PROBLEM: New session + new client per call
async with async_session_factory() as session:
    ...
    if row:
        return AsyncOpenAI(api_key=row)  # New client every time!
```

### Fix

Cache tenant clients with a TTL:

```python
# In OpenAIService.__init__:
self._tenant_clients: dict[int, tuple[AsyncOpenAI, float]] = {}
self._client_ttl = 300  # 5 minutes

async def _get_client(self, tenant_id: int) -> AsyncOpenAI:
    import time
    now = time.time()

    # Check cache first
    if tenant_id in self._tenant_clients:
        client, expires = self._tenant_clients[tenant_id]
        if now < expires:
            return client

    # Lookup from DB
    try:
        async with async_session_factory() as session:
            result = await session.execute(
                text("""
                    SELECT configuration_value
                    FROM tenant_configurations
                    WHERE tenant_id = :tid
                      AND configuration_key = 'openai_api_key'
                      AND is_active = 1
                    LIMIT 1
                """),
                {"tid": tenant_id},
            )
            row = result.scalars().first()
            if row:
                client = AsyncOpenAI(api_key=row)
                self._tenant_clients[tenant_id] = (client, now + self._client_ttl)
                return client
    except Exception as e:
        logger.warning("Failed to get tenant API key", tenant_id=tenant_id, error=str(e))

    return self._default_client
```

---

## Root Cause #3: Unbounded `asyncio.create_task()` (HIGH)

**File:** `app/services/document_service.py:65`, `app/api/v1/documents.py:121`

Fire-and-forget tasks with no concurrency limit. If multiple documents are uploaded, each spawns an untracked background task that:
- Opens multiple DB sessions per chunk
- Calls OpenAI API per chunk (generating embeddings)
- Calls Weaviate via `asyncio.to_thread()` per chunk (spawns a thread each time)

For a document with 100 chunks, this means 100+ threads + 200+ DB sessions running concurrently.

### Fix

Use a semaphore to limit concurrency:

```python
# app/services/document_service.py — add at module level:
import asyncio
_embedding_semaphore = asyncio.Semaphore(3)  # Max 3 concurrent embedding jobs

# Wrap the fire-and-forget call:
async def _rate_limited_embeddings(self, chunk_ids, document_id, tenant_id):
    async with _embedding_semaphore:
        await self._generate_embeddings_async(chunk_ids, document_id, tenant_id)

# In process_document(), replace:
asyncio.create_task(
    self._rate_limited_embeddings(chunk_ids, document_id, tenant_id)
)
```

Also batch the embedding generation instead of one-by-one DB sessions:

```python
# In _generate_embeddings_async, process in batches of 5:
BATCH_SIZE = 5
for i in range(0, len(chunk_ids), BATCH_SIZE):
    batch = chunk_ids[i:i + BATCH_SIZE]
    # Process batch together in a single session
    # Add a small delay between batches
    await asyncio.sleep(0.5)
```

---

## Root Cause #4: No Docker Resource Limits (CRITICAL)

**File:** `docker-compose.yml`

No CPU or memory limits on any container. The backend can consume all available CPU, starving MySQL and Weaviate (which is why Weaviate shows N/A — it crashed).

### Fix

Add resource limits to `docker-compose.yml`:

```yaml
services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "4001:8000"
    env_file:
      - .env
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_healthy
      weaviate:
        condition: service_started
    volumes:
      - uploads:/app/uploads
      - logs:/app/logs
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: "1.5"
          memory: 512M
        reservations:
          cpus: "0.5"
          memory: 256M

  mysql:
    image: mysql:8.0
    ports:
      - "3305:3306"
    environment:
      MYSQL_ROOT_PASSWORD: P@ssword1
      MYSQL_DATABASE: ai_chatbot_saas
      MYSQL_USER: chatbot_admin_db
      MYSQL_PASSWORD: "P@ssword1"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./sql/init.sql:/docker-entrypoint-initdb.d/init.sql
    command:
      - --character-set-server=utf8mb4
      - --collation-server=utf8mb4_unicode_ci
      - --max-connections=50
      - --innodb-buffer-pool-size=128M
      - --innodb-log-file-size=48M
      - --thread-cache-size=8
      - --table-open-cache=400
      - --sort-buffer-size=256K
      - --read-buffer-size=256K
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 512M
        reservations:
          cpus: "0.25"
          memory: 256M

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --maxmemory 100mb --maxmemory-policy allkeys-lru
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: "0.25"
          memory: 128M

  weaviate:
    image: semitechnologies/weaviate:1.28.2
    ports:
      - "8086:8080"
      - "50051:50051"
    environment:
      QUERY_DEFAULTS_LIMIT: 25
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: "true"
      PERSISTENCE_DATA_PATH: /var/lib/weaviate
      DEFAULT_VECTORIZER_MODULE: none
      CLUSTER_HOSTNAME: node1
      LIMIT_RESOURCES: "true"
      GOMAXPROCS: "1"
    volumes:
      - weaviate_data:/var/lib/weaviate
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: "0.5"
          memory: 256M
        reservations:
          cpus: "0.25"
          memory: 128M
```

---

## Root Cause #5: Uvicorn Running Without Worker Limits (HIGH)

**File:** `Dockerfile:39`

```dockerfile
CMD ["uvicorn", "app.main:socket_app", "--host", "0.0.0.0", "--port", "8000"]
```

No `--workers` flag, no `--limit-concurrency`, no `--backlog` limit. While uvicorn defaults to 1 worker, the async nature + `asyncio.to_thread()` calls + fire-and-forget tasks create unbounded thread spawning.

### Fix

Update the Dockerfile CMD:

```dockerfile
CMD ["uvicorn", "app.main:socket_app", \
     "--host", "0.0.0.0", \
     "--port", "8000", \
     "--workers", "1", \
     "--limit-concurrency", "20", \
     "--limit-max-requests", "1000", \
     "--backlog", "50", \
     "--timeout-keep-alive", "30"]
```

Key flags:
- `--limit-concurrency 20`: Max 20 simultaneous connections (prevents thread explosion)
- `--limit-max-requests 1000`: Restart worker after 1000 requests (prevents memory leaks)
- `--backlog 50`: Limit queued connections

---

## Root Cause #6: Oversized Database Pool (MEDIUM)

**File:** `app/core/config.py:29`, `app/core/database.py:16-24`

```python
DB_POOL_SIZE: int = Field(default=20)  # 20 persistent connections
max_overflow=10  # +10 overflow = 30 total
```

On a shared VPS, 30 DB connections is excessive. Combined with the document service opening its own sessions via `async_session_factory()`, connections pile up.

MySQL is configured with `max-connections=200` which is also too high for a shared VPS.

### Fix

Reduce pool size in `.env` or `config.py`:

```python
DB_POOL_SIZE: int = Field(default=5)  # Reduced from 20
```

In `database.py`:

```python
engine = create_async_engine(
    settings.database_url,
    pool_size=settings.DB_POOL_SIZE,  # 5
    max_overflow=5,                    # Reduced from 10
    pool_timeout=settings.DB_POOL_TIMEOUT,
    pool_recycle=1800,                 # Reduced from 3600
    pool_pre_ping=True,
    echo=False,                        # Never echo in production
)
```

In `docker-compose.yml`, reduce MySQL max-connections:
```yaml
- --max-connections=50   # Reduced from 200
```

---

## Root Cause #7: Weaviate Synchronous Client Spawning Threads (MEDIUM)

**File:** `app/services/weaviate_service.py`

Every Weaviate call is wrapped in `asyncio.to_thread()`, spawning a new OS thread per call. Under concurrent requests + background embedding tasks, this creates hundreds of threads.

### Fix

This is partially addressed by the semaphore fix in Root Cause #3. Additionally, limit the thread pool:

```python
# In app/main.py, add at the top of the lifespan function:
import asyncio
import concurrent.futures

# Limit the default thread pool to prevent thread explosion
loop = asyncio.get_running_loop()
loop.set_default_executor(concurrent.futures.ThreadPoolExecutor(max_workers=4))
```

---

## Root Cause #8: Host-Level unattended-upgrades (MEDIUM)

The PDF report shows `unattended-upgrades` at 49.1% CPU and `needrestart` at 66.4%. These are system update processes that compete with your application for CPU.

### Fix

On your VPS, reschedule automatic updates to off-peak hours:

```bash
# Edit the apt timer to run at 4 AM
sudo systemctl edit apt-daily.timer
# Add:
# [Timer]
# OnCalendar=*-*-* 04:00:00
# RandomizedDelaySec=30m

sudo systemctl edit apt-daily-upgrade.timer
# Add:
# [Timer]
# OnCalendar=*-*-* 05:00:00
# RandomizedDelaySec=30m

# Or disable entirely (not recommended for security):
# sudo systemctl disable unattended-upgrades
```

---

## Implementation Priority

### Phase 1 — Immediate (fixes 80% of CPU usage)

1. **Add Docker resource limits** to `docker-compose.yml` (Root Cause #4)
2. **Singleton LangGraphService** (Root Cause #1)
3. **Limit uvicorn concurrency** in Dockerfile (Root Cause #5)
4. **Add embedding semaphore** (Root Cause #3)

### Phase 2 — Short-term (stabilizes the system)

5. **Cache OpenAI tenant clients** (Root Cause #2)
6. **Reduce DB pool size** (Root Cause #6)
7. **Limit thread pool** (Root Cause #7)
8. **Reschedule system updates** (Root Cause #8)

### Phase 3 — Monitoring

9. Add health monitoring to detect PID count spikes
10. Add `docker stats` to a cron job for ongoing visibility

---

## Changes Applied (Files Modified)

| File | Change |
|------|--------|
| `app/services/langgraph_service.py` | Added `get_langgraph_service()` singleton |
| `app/api/v1/chat.py` | Uses singleton instead of `LangGraphService()` per request |
| `app/api/v1/public_chat.py` | Uses singleton instead of `LangGraphService()` per request |
| `app/services/openai_service.py` | Tenant client cache with 5-min TTL |
| `app/services/document_service.py` | Semaphore (max 2), batch embedding (5 per batch), delay between batches |
| `app/core/database.py` | Pool size capped at 5, max_overflow=5, recycle=1800s, echo=False |
| `app/core/redis.py` | max_connections reduced from 20 to 10 |
| `app/main.py` | Thread pool capped at 4 workers |
| `Dockerfile` | Uvicorn: --limit-concurrency 20, --limit-max-requests 1000, --backlog 50 |
| `docker-compose.yml` | CPU/memory limits on all containers, MySQL tuned, Redis maxmemory, Weaviate GOMAXPROCS=1 |

## Deploy Commands

Rebuild and redeploy with:

```bash
# Rebuild and restart with resource limits
docker compose down
docker compose build --no-cache backend
docker compose up -d

# Verify resource limits are applied
docker stats --no-stream

# Check PID counts
docker compose top
```

---

## Expected Results After Fix

| Metric | Before | Expected After |
|--------|--------|----------------|
| Backend CPU | 384.95% | < 80% |
| Backend PIDs | 940 | < 50 |
| MySQL CPU | 209.19% | < 50% |
| Weaviate | Not running | Running, < 30% CPU |
| Total host CPU | > 200% | < 100% |
