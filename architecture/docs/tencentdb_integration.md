# Tencent database integration

The chatbot can use Tencent-managed databases without changing its model or
RAG routing path.

## Storage roles

- **TencentDB for Redis** stores recent session turns and distributed
  per-tenant rate-limit windows. The client uses the Redis protocol and accepts
  `redis://` or TLS-enabled `rediss://` connection URLs.
- **TencentDB for PostgreSQL** stores the audit ledger, retained interactions,
  human reviews, training approvals, and RAG approvals. The client uses the
  PostgreSQL protocol through `asyncpg` and supports an SSL-enabled DSN.
- **Qdrant remains the vector database** for semantic document retrieval.
- **Neo4j/Graphiti remains the relationship memory** for entities and temporal
  facts. TencentDB complements these stores; it does not replace them.

## Configuration

Inject credentials from the deployment secret manager:

```dotenv
CYBERAGENT_SESSION_CACHE_BACKEND=tencentdb_redis
TENCENTDB_REDIS_URL=rediss://:password@redis-host:port/0

CYBERAGENT_AUDIT_BACKEND=tencentdb_postgres
CYBERAGENT_LEARNING_BACKEND=tencentdb_postgres
TENCENTDB_POSTGRES_URL=postgresql://user:password@postgres-host:port/cyberagent?sslmode=require
CYBERAGENT_MANAGED_STORAGE_RETRY_SECONDS=30
```

Use private-network endpoints where possible. `/ready` rejects traffic when an
enabled managed store is unavailable, while `/health` reports each configured
TencentDB component. Database passwords are omitted from application logs.
Failed connections are retried after the configured backoff without restarting
the chatbot.

The local fallback behavior remains available during development: session
memory falls back to process memory, learning data to SQLite, and audit data to
memory. Production readiness still fails while a configured managed service is
unavailable, preventing an unhealthy instance from receiving traffic.
