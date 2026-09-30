# Enterprise readiness

The runtime keeps the request path sequential: policy, bounded retrieval, Muse Glimmer routing/enrichment, one specialist harness, validation, and persistence. This document records the deployment controls required to promote the RunPod test deployment.

## Required services

- Persistent Graphiti backed by Neo4j (`NEO4J_URI`, `NEO4J_USER`, `NEO4J_PASSWORD`)
- Qdrant with dense and keyword payload indexes
- Secret manager injected environment variables; do not commit credentials
- TLS reverse proxy and tenant-aware authentication
- A durable queue (Redis, NATS, or Kafka) when running more than one API worker
- Rootless gVisor/Firecracker sandbox for tools

`CYBERAGENT_API_TOKEN` is the administrative API key. For application traffic,
inject `CYBERAGENT_TENANT_API_KEYS_JSON` from the secret manager. A tenant key
can call chat, streaming, ingestion, and upload endpoints only with its own
`tenant_id`; the administrative key can operate across tenants.

The runtime never executes tool commands in the API process. When
`CYBERAGENT_SANDBOX_BACKEND=remote`, it sends only allowlisted commands with an
authorized target scope to `/v1/execute` on a separately deployed gVisor or
Firecracker executor. Keep the backend disabled until that service and its
token are configured.

## Retrieval and quality

Enable hybrid retrieval and reranking with `CYBERAGENT_RETRIEVAL_MODE=hybrid` and `CYBERAGENT_RERANKER_ENABLED=true`. Index every source with tenant, authority, license, timestamp, and content hash metadata. Keep the top 3–8 reranked chunks in the specialist context.

Graph memory is retrieved for every request and sent to Muse Glimmer and the selected specialist. `CYBERAGENT_GRAPH_RETRIEVAL_LIMIT` controls fact count, `CYBERAGENT_GRAPH_CONTEXT_CHARS` reserves prompt space for entity relationships, and `CYBERAGENT_GRAPH_SEARCH_TIMEOUT_SECONDS` bounds Neo4j latency. Graph facts support continuity; the current user request remains the routing authority.

## Operations

Warm Muse Glimmer with `python scripts/warmup_models.py` after Ollama becomes
healthy. Specialists remain cold until selected so a 16 GB GPU holds only one
large model at a time. Export request-stage latency and VRAM metrics, enforce
per-tenant rate limits, and run the versioned evaluation set before changing
model or prompt revisions.

The authenticated JSON metrics endpoint is `/v1/metrics`; Prometheus format is
available at `/metrics`. The enterprise environment example enables OTLP HTTP
tracing. Deploy an OpenTelemetry collector at the configured endpoint before
turning that setting on.
