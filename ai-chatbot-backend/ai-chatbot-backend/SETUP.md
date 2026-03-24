# Setup Guide — AI Chatbot SaaS Backend (Python)

> FastAPI + Uvicorn + SQLAlchemy + LangGraph + OpenAI + Weaviate + MySQL + Redis

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start (Docker)](#quick-start-docker)
- [Quick Start (Local)](#quick-start-local)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Server](#running-the-server)
- [Verifying the Setup](#verifying-the-setup)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Docker Reference](#docker-reference)
- [Database Migrations](#database-migrations)
- [External Services](#external-services)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Requirement | Version | Purpose |
|-------------|---------|---------|
| Python | >= 3.12 | Runtime |
| Docker + Docker Compose | Latest | MySQL, Redis, Weaviate containers |
| pip | Latest | Package management |
| Git | Latest | Version control |

**Optional (for full AI features):**

| Service | Purpose | Required For |
|---------|---------|-------------|
| OpenAI API key | LLM + embeddings | Chat messages, document search, RAG pipeline |
| Stripe API key | Payment processing | Stripe checkout, subscriptions |
| Razorpay API key | Payment processing (India) | Razorpay subscriptions |
| LangSmith API key | LLM tracing/debugging | Observability (optional) |

---

## Quick Start (Docker)

**Full stack in Docker** — backend + all services in containers.

```bash
# 1. Clone and navigate
cd ai-chatbot-backend-python

# 2. Create environment file
cp .env.example .env
# Edit .env with your values (see Environment Variables section)

# 3. Start everything
docker compose -f docker-compose.dev.yml up -d

# 4. Verify
curl http://localhost:8000/health
# {"status":"ok","timestamp":...}

curl http://localhost:8000/api/health/detailed
# All services should show "healthy"
```

The `docker-compose.dev.yml` starts:
- **Backend** (FastAPI) on port `8000` with hot reload
- **MySQL 8.0** on port `3306` (auto-initializes schema from `sql/init.sql`)
- **Redis 7** on port `6379`
- **Weaviate 1.28.2** on port `8080`

---

## Quick Start (Local)

**Run backend locally** with Docker for MySQL/Redis/Weaviate only.

### Step 1: Start Infrastructure Services

```bash
cd ai-chatbot-backend-python

# Start only MySQL, Redis, Weaviate
docker compose -f docker-compose.dev.yml up -d mysql redis weaviate

# Wait for MySQL to be healthy (~15-30 seconds on first run)
docker ps --format "table {{.Names}}\t{{.Status}}"
# All containers should show "healthy"
```

### Step 2: Install Python Dependencies

```bash
# Create virtual environment (recommended)
python -m venv .venv

# Activate it
# Linux/Mac:
source .venv/bin/activate
# Windows:
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Step 3: Configure Environment

```bash
# Copy example environment file
cp .env.example .env
```

Edit `.env` with your settings. At minimum, set:

```env
# Required
JWT_SECRET=your-32-char-secret-key-here-min
JWT_REFRESH_SECRET=another-32-char-secret-here-min
DEFAULT_OPENAI_API_KEY=sk-your-openai-api-key

# These match docker-compose defaults — no changes needed
DB_HOST=localhost
DB_PORT=3306
DB_USER=chatbot_admin_db
DB_PASSWORD=P@ssword1
DB_NAME=ai_chatbot_saas
REDIS_URL=redis://localhost:6379/0
WEAVIATE_URL=http://localhost:8080
```

### Step 4: Create Directories

```bash
mkdir -p uploads/documents logs
```

### Step 5: Start the Server

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

You should see:

```
Starting AI Chatbot Backend (Python/FastAPI)...
Environment: development
Port: 8000
Database connection established
Database initialized
Redis connection established
Redis initialized
Weaviate client initialized
Weaviate schema initialized
All services initialized successfully
API docs available at http://localhost:8000/docs
Uvicorn running on http://0.0.0.0:8000
```

---

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET` | JWT signing key (min 32 chars) | `f93a2e4cbd674d1e8b79f6d245e8127a` |
| `JWT_REFRESH_SECRET` | Refresh token key (min 32 chars) | `9a5ef38d1c7b4f4891d62e7a53b4f1c2` |
| `DEFAULT_OPENAI_API_KEY` | OpenAI API key | `sk-proj-...` |

### Server

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_ENV` | `development` | Environment: `development`, `production`, `test` |
| `APP_PORT` | `8000` | HTTP port |
| `API_VERSION` | `v1` | API version prefix |
| `DEBUG` | `false` | Enable debug mode |

### Database (MySQL)

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | — | Full URL (overrides individual settings) |
| `DB_HOST` | `localhost` | MySQL host |
| `DB_PORT` | `3306` | MySQL port |
| `DB_USER` | `root` | MySQL username |
| `DB_PASSWORD` | — | MySQL password |
| `DB_NAME` | `ai_chatbot_saas` | Database name |
| `DB_POOL_SIZE` | `20` | Connection pool size |
| `DB_POOL_TIMEOUT` | `60` | Pool timeout in seconds |

> **Note:** If your password contains special characters (like `@`, `#`, `%`), they are automatically URL-encoded by the application.

### Redis

| Variable | Default | Description |
|----------|---------|-------------|
| `REDIS_URL` | — | Full Redis URL (overrides individual settings) |
| `REDIS_HOST` | `localhost` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |
| `REDIS_PASSWORD` | — | Redis password |
| `REDIS_DB` | `0` | Redis database number |

### OpenAI

| Variable | Default | Description |
|----------|---------|-------------|
| `DEFAULT_OPENAI_API_KEY` | — | Default API key (tenants can override) |
| `OPENAI_MODEL` | `gpt-4` | Chat completion model |
| `OPENAI_EMBEDDING_MODEL` | `text-embedding-3-small` | Embedding model |
| `OPENAI_MAX_TOKENS` | `4000` | Max tokens per request |
| `OPENAI_TEMPERATURE` | `0.7` | Response randomness |

### Weaviate

| Variable | Default | Description |
|----------|---------|-------------|
| `WEAVIATE_URL` | `http://localhost:8080` | Weaviate server URL |
| `WEAVIATE_API_KEY` | — | Weaviate API key (if auth enabled) |

### LangSmith (Optional)

| Variable | Default | Description |
|----------|---------|-------------|
| `LANGCHAIN_TRACING_V2` | `false` | Enable LangSmith tracing |
| `LANGCHAIN_API_KEY` | — | LangSmith API key |
| `LANGCHAIN_PROJECT` | `ai-chatbot-backend` | Project name |
| `LANGCHAIN_ENDPOINT` | `https://api.smith.langchain.com` | API endpoint |

### Payments (Optional)

| Variable | Default | Description |
|----------|---------|-------------|
| `STRIPE_SECRET_KEY` | — | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | — | Stripe webhook signing secret |
| `RAZORPAY_KEY_ID` | — | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | — | Razorpay key secret |

### Security

| Variable | Default | Description |
|----------|---------|-------------|
| `CORS_ORIGINS` | `http://localhost:3000,http://localhost:8000` | Allowed CORS origins (comma-separated) |
| `BCRYPT_ROUNDS` | `12` | Password hashing rounds |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Max requests per window |

### Logging

| Variable | Default | Description |
|----------|---------|-------------|
| `LOG_LEVEL` | `INFO` | Log level: `DEBUG`, `INFO`, `WARNING`, `ERROR` |
| `LOG_FILE` | `./logs/app.log` | Log file path |
| `LOG_MAX_SIZE` | `10 MB` | Log rotation size |
| `LOG_MAX_FILES` | `5` | Max rotated log files |

---

## Database Setup

### Automatic (Docker — Recommended)

When using Docker Compose, the database is automatically initialized:
- `sql/init.sql` creates all 20 tables
- Sample data is inserted (tenants, users, documents, sessions, etc.)
- MySQL is configured with `utf8mb4` charset

### Manual (Existing MySQL)

If you have an existing MySQL server:

```bash
# 1. Create the database
mysql -u root -p -e "CREATE DATABASE ai_chatbot_saas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. Create the user
mysql -u root -p -e "CREATE USER 'chatbot_admin_db'@'%' IDENTIFIED BY 'P@ssword1';"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON ai_chatbot_saas.* TO 'chatbot_admin_db'@'%'; FLUSH PRIVILEGES;"

# 3. Initialize the schema with sample data
mysql -u chatbot_admin_db -p ai_chatbot_saas < sql/init.sql
```

### Sample Data

The `sql/init.sql` includes:

| Table | Sample Records | Description |
|-------|---------------|-------------|
| `tenants` | 8 | TechCorp, StartupHub, LocalBiz, etc. |
| `users` | 19 | Admin, support, customer roles across tenants |
| `documents` | 10 | User manuals, API refs, handbooks |
| `document_chunks` | 5 | Pre-chunked text segments |
| `chat_sessions` | 8 | Active and ended sessions |
| `chat_messages` | 20 | User + assistant messages |
| `subscriptions` | 6 | Free, basic, pro, enterprise plans |
| `invoices` | 8 | Paid and pending invoices |
| `notifications` | 8 | Various notification types |

> **Note:** Password hashes in the sample data use an unknown plaintext. To log in with sample users, update the password hash using the provided script (see [Test Accounts](#test-accounts)).

### Test Accounts

To set a known password for a sample user:

```bash
cd ai-chatbot-backend-python

# Generate a bcrypt hash
python -c "from app.core.security import hash_password; print(hash_password('Test123!'))"
# Copy the output hash

# Update via Docker MySQL (avoids shell escaping issues with $ in bcrypt hashes)
printf "UPDATE users SET password_hash='PASTE_HASH_HERE', role='super_admin' WHERE email='admin@techcorp.com';\n" > /tmp/pw.sql
docker cp /tmp/pw.sql ai-chatbot-backend-python-mysql-1:/tmp/pw.sql
docker exec ai-chatbot-backend-python-mysql-1 mysql -u root -prootpassword ai_chatbot_saas -e "source /tmp/pw.sql"
```

You can then log in with:

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@techcorp.com","password":"Test123!"}'
```

Or create a fresh account via the register endpoint (easier):

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "myuser@example.com",
    "password": "Test123!",
    "firstName": "John",
    "lastName": "Doe",
    "tenantSlug": "techcorp"
  }'
```

> **Note:** Bcrypt hashes contain `$` characters which get interpreted by shell. Always use a SQL file with `docker cp` + `source` instead of inline `docker exec mysql -e "..."` commands.

---

## Running the Server

### Development (with hot reload)

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Production

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Via Docker

```bash
# Development (hot reload, mounted volumes)
docker compose -f docker-compose.dev.yml up -d

# Production (multi-stage build, 4 workers)
docker compose up -d
```

### Programmatic

```python
from app.main import create_app

app = create_app()
# Use with ASGI server (Gunicorn, Daphne, etc.)
```

---

## Verifying the Setup

### 1. Health Check

```bash
curl http://localhost:8000/health
# {"status":"ok","timestamp":1770817283.13}
```

### 2. Detailed Health (all services)

```bash
curl http://localhost:8000/api/health/detailed
```

Expected response:
```json
{
  "status": "healthy",
  "services": {
    "database": { "status": "healthy", "details": { "connected": true, "responseTime": 11 } },
    "redis": { "status": "healthy", "details": { "connected": true, "responseTime": 2 } },
    "weaviate": { "status": "healthy", "details": { "connected": true, "responseTime": 27, "version": "1.28.2" } }
  }
}
```

### 3. API Endpoints Count

```bash
curl -s http://localhost:8000/openapi.json | python -c "
import sys, json
spec = json.load(sys.stdin)
count = sum(len(m) for m in spec['paths'].values())
print(f'Total endpoints: {count}')
"
# Total endpoints: 153
```

### 4. Auth Flow Test

```bash
# Register
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","firstName":"Test","lastName":"User","tenantSlug":"techcorp"}'

# Login (use the email you just registered)
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!"}'

# Use the accessToken from login response
TOKEN="eyJhbGci..."

# Get profile
curl http://localhost:8000/api/v1/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Swagger UI

Open in browser: [http://localhost:8000/docs](http://localhost:8000/docs)

All 153 endpoints are documented with request/response schemas.

---

## API Documentation

| URL | Description |
|-----|-------------|
| `http://localhost:8000/docs` | Swagger UI (interactive) |
| `http://localhost:8000/redoc` | ReDoc (read-only) |
| `http://localhost:8000/openapi.json` | OpenAPI 3.0 JSON spec |

### Endpoint Categories

| Category | Prefix | Endpoints | Auth Required |
|----------|--------|-----------|--------------|
| Health | `/health`, `/api/health` | 3 | No |
| Auth | `/api/v1/auth` | 8 | Mixed |
| Users | `/api/v1/users` | 14 | Yes |
| Tenants | `/api/v1/tenants` | 14 | Yes (admin) |
| Documents | `/api/v1/documents` | 12 | Yes |
| Chat | `/api/v1/chat` | 10 | Yes |
| Public Chat | `/api/v1/public/chat` | 6 | No |
| Analytics | `/api/v1/analytics` | 10 | Yes (admin) |
| Admin | `/api/v1/admin` | 33 | Yes (super_admin) |
| Plans | `/api/v1/plans` | 4 | Yes |
| Subscriptions | `/api/v1/subscriptions` | 15 | Yes |
| Payments | `/api/v1/payments` | 6 | Yes |
| Orders | `/api/v1/orders` | 4 | Yes |
| Invoices | `/api/v1/invoices` | 5 | Yes |
| Stripe | `/api/v1/stripe` | 9 | Mixed |

### Response Format

All endpoints follow a consistent response format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
```

---

## Project Structure

```
ai-chatbot-backend-python/
├── app/
│   ├── main.py                    # FastAPI app, lifespan, middleware
│   ├── core/                      # Config, DB, Redis, security, logging
│   ├── models/                    # SQLAlchemy ORM models (18 tables)
│   ├── schemas/                   # Pydantic request/response schemas
│   ├── repositories/              # Data access layer (10 repos)
│   ├── services/                  # Business logic + AI services
│   │   ├── auth_service.py        # Login, register, JWT tokens
│   │   ├── openai_service.py      # Chat completion + embeddings
│   │   ├── weaviate_service.py    # Vector storage + search
│   │   ├── langgraph_service.py   # RAG pipeline (StateGraph)
│   │   ├── document_service.py    # PDF processing orchestrator
│   │   └── pdf_service.py         # Text extraction + chunking
│   ├── api/v1/                    # Route handlers (14 files, 153 endpoints)
│   ├── middleware/                 # Request ID, logging, CORS, tenant
│   └── websocket/                 # Socket.IO manager
├── sql/init.sql                   # MySQL schema + sample data
├── alembic/                       # Database migrations
├── tests/                         # Test suite
├── test_endpoints.py              # Automated endpoint tests (74 endpoints)
├── requirements.txt               # Python dependencies
├── pyproject.toml                 # Project config
├── docker-compose.yml             # Production Docker setup
├── docker-compose.dev.yml         # Development Docker setup
├── Dockerfile                     # Production multi-stage build
├── Dockerfile.dev                 # Development with hot reload
├── .env.example                   # Environment template
├── IMPLEMENTATION_SUMMARY.md      # Full implementation docs
└── TESTING_REPORT.md              # Endpoint test results
```

---

## Docker Reference

### Development

```bash
# Start all services (backend + MySQL + Redis + Weaviate)
docker compose -f docker-compose.dev.yml up -d

# Start infrastructure only (run backend locally)
docker compose -f docker-compose.dev.yml up -d mysql redis weaviate

# View logs
docker compose -f docker-compose.dev.yml logs -f backend

# Stop everything
docker compose -f docker-compose.dev.yml down

# Stop and remove volumes (reset database)
docker compose -f docker-compose.dev.yml down -v
```

### Production

```bash
# Build and start
docker compose up -d --build

# Scale backend
docker compose up -d --scale backend=3

# View logs
docker compose logs -f

# Stop
docker compose down
```

### Container Details

| Service | Image | Ports | Volumes |
|---------|-------|-------|---------|
| backend | `python:3.12-slim` | 8000 | uploads, logs |
| mysql | `mysql:8.0` | 3306 | mysql_data |
| redis | `redis:7-alpine` | 6379 | redis_data |
| weaviate | `semitechnologies/weaviate:1.28.2` | 8080, 50051 | weaviate_data |

### Health Checks

```bash
# MySQL
docker exec ai-chatbot-backend-python-mysql-1 mysqladmin ping -h localhost

# Redis
docker exec ai-chatbot-backend-python-redis-1 redis-cli ping

# Weaviate
curl http://localhost:8080/v1/meta

# Backend
curl http://localhost:8000/health
```

---

## Database Migrations

Alembic is configured for schema migrations. The `sql/init.sql` is used for fresh setups; Alembic handles incremental changes.

### Generate a Migration

```bash
# Auto-generate from model changes
alembic revision --autogenerate -m "description of changes"
```

### Run Migrations

```bash
# Upgrade to latest
alembic upgrade head

# Upgrade one step
alembic upgrade +1

# Downgrade one step
alembic downgrade -1

# View history
alembic history
```

### Reset Database

```bash
# Docker: destroy and recreate the MySQL volume
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up -d mysql redis weaviate
# Wait for MySQL to re-initialize with sql/init.sql
```

---

## External Services

### OpenAI

Required for chat message generation, document search, and the RAG pipeline.

1. Get an API key from [platform.openai.com](https://platform.openai.com)
2. Set `DEFAULT_OPENAI_API_KEY=sk-...` in `.env`
3. Tenants can override with their own key via tenant configuration

**Features powered by OpenAI:**
- `POST /api/v1/chat/sessions/{id}/messages` — AI chat responses
- `POST /api/v1/documents/search` — Semantic document search
- `POST /api/v1/documents/upload` — Document embedding generation
- `POST /api/v1/public/chat/session/{token}/message` — Public widget chat

### LangSmith (Optional)

For tracing and debugging LLM calls:

1. Get an API key from [smith.langchain.com](https://smith.langchain.com)
2. Set in `.env`:
   ```env
   LANGCHAIN_TRACING_V2=true
   LANGCHAIN_API_KEY=ls_...
   LANGCHAIN_PROJECT=ai-chatbot-backend
   ```

### Stripe (Optional)

For payment processing:

1. Get keys from [dashboard.stripe.com](https://dashboard.stripe.com)
2. Set in `.env`:
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
3. Set up webhook endpoint: `POST /api/v1/stripe/webhook`

### Razorpay (Optional)

For payment processing (India):

1. Get keys from [dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Set in `.env`:
   ```env
   RAZORPAY_KEY_ID=rzp_test_...
   RAZORPAY_KEY_SECRET=...
   ```
3. Set up webhook endpoint: `POST /api/v1/subscriptions/webhook`

---

## Troubleshooting

### Server won't start — "Can't connect to MySQL"

MySQL, Redis, and Weaviate are all non-fatal at startup. The server will start without them, but database operations will fail.

```bash
# Check if Docker containers are running
docker ps

# Check MySQL health
docker logs ai-chatbot-backend-python-mysql-1

# If MySQL is still initializing, wait 30 seconds
```

### "Can't connect to MySQL server on 'ssword1@localhost'"

The `@` character in your password is being interpreted as a URL separator. This is fixed in the application code (passwords are URL-encoded via `quote_plus`). If you see this error on an older version, update `app/core/config.py` to use `quote_plus()` in the `database_url` property.

### "Attribute name 'metadata' is reserved"

SQLAlchemy reserves the `metadata` attribute name. Model attributes mapping to a `metadata` database column must use a different Python name:

```python
# Correct
chunk_metadata: Mapped[dict | None] = mapped_column("metadata", JSON, nullable=True)

# Wrong — will crash
metadata: Mapped[dict | None] = mapped_column(JSON, nullable=True)
```

### Unicode logging errors on Windows

Windows console uses cp1252 encoding which can't render Unicode characters. The application wraps stdout with UTF-8 encoding. If you still see `UnicodeEncodeError`, set the environment variable:

```bash
set PYTHONIOENCODING=utf-8
```

### Port 8000 already in use

```bash
# Find the process
# Linux/Mac:
lsof -i :8000
# Windows:
netstat -aon | findstr :8000

# Kill it
# Linux/Mac:
kill -9 <PID>
# Windows:
taskkill /F /PID <PID>
```

### Redis connection refused

```bash
# Check if Redis container is running
docker ps | grep redis

# If not running
docker compose -f docker-compose.dev.yml up -d redis
```

### Weaviate schema errors

If you need to reset the Weaviate schema:

```bash
# Delete and recreate the container
docker compose -f docker-compose.dev.yml down weaviate
docker volume rm ai-chatbot-backend-python_weaviate_data 2>/dev/null
docker compose -f docker-compose.dev.yml up -d weaviate
```

The application automatically creates the `DocumentChunk` collection on startup.

### "ResourceClosedError: This result object is closed"

This happens when `.scalar()` is called twice on the same SQLAlchemy result. Always store the result in a variable:

```python
# Wrong
return {"total": result.scalar(), "pages": result.scalar() // limit}

# Correct
total = result.scalar() or 0
return {"total": total, "pages": total // limit}
```

### "TypeError: can't compare offset-naive and offset-aware datetimes"

MySQL returns naive datetimes (no timezone info). When comparing with Python datetimes, use `datetime.utcnow()` (naive) instead of `datetime.now(timezone.utc)` (aware):

```python
# Wrong — MySQL datetime is naive, this is aware
if user.locked_until > datetime.now(timezone.utc):

# Correct — both are naive
if user.locked_until > datetime.utcnow():
```

---

## Running Tests

### Automated Endpoint Tests

A comprehensive test script is included that tests all 74 endpoints against a live server:

```bash
# Ensure server is running first
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# Run endpoint tests (in another terminal)
python test_endpoints.py
```

The script uses timestamp-based emails and is fully idempotent — safe to run multiple times.

**Latest results: 74/74 endpoints passed (100%)**

### Unit Tests (pytest)

```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/test_auth.py

# Run with coverage
pytest --cov=app
```

Test configuration is in `pyproject.toml`:

```toml
[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
```
