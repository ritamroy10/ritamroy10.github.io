# Efficiency and quality controls

The request path remains sequential: policy, adaptive retrieval, Muse Glimmer,
one selected specialist, evidence validation, response streaming, and memory
persistence.

## Adaptive execution

Requests are classified as `simple`, `standard`, `complex`, or
`document_review`. The profile controls context size, retrieval count,
conditional neural reranking, output tokens, and corrective retries. Muse
Glimmer includes the final complexity in its enriched context; deterministic
profiling establishes a minimum for long inputs and attachments.

## Retrieval and caching

Retrieval uses route-aware query enrichment, session memory, Qdrant, and
Graphiti. Complex and document-review requests enable the neural reranker.
Short requests use the low-latency hybrid reranker. Retrieval and routing have
bounded TTL caches. Complete responses are cached only for simple requests
without attachments or conversation context, and cache keys include tenant and
the document-knowledge revision.

Qdrant connectivity has a two-second deployment default and a thirty-second
failure backoff. During an outage, the first failed probe uses the local
fallback and later requests avoid repeating the same network delay.

## Documents and evidence

Uploaded documents are chunked on line boundaries and indexed with content
hashes and line ranges. Unchanged documents are not embedded twice. Large
ingestions use bounded batches. PDF page count, spreadsheet cell count,
extracted text size, and binary masquerading as text are limited.

The code-review tool performs deterministic source-linked checks before model
judgment. High or critical findings without supporting context, tool, or web
evidence are downgraded and marked unsupported. Every displayed finding shows
its grounding state.

## Memory and GPU operation

Recent turns are compacted after twelve cache entries. Older content becomes a
bounded structured summary while the five newest turns remain verbatim.
Graph facts include confidence, source, lifetime, and status metadata.
When background writes are enabled, Qdrant, Graphiti, learning, and audit
writes use a bounded queue with a disk journal. Unfinished journal entries are
replayed after restart and graceful shutdown drains accepted writes.

Ollama deployments use a lifecycle manager. It unloads the previous model when
the route changes, ensuring that Muse Glimmer and multiple specialists are not
kept in a 16 GB GPU at the same time.

## Metrics and evaluation

`/v1/metrics` exposes context, routing, specialist, model-switch, persistence,
cache, and total-request timings. The evaluation report includes route
accuracy, guardrail accuracy, average latency, and finding-grounding rate.
Evaluation cases may declare forbidden phrases and a minimum grounding rate.
Harness coverage measures the four required specialist routes actually run by
the evaluation set; a configured but untested harness does not count.

Prometheus scrapes the same counters from `/metrics`. Set
`CYBERAGENT_OTEL_ENABLED=true` and an OTLP HTTP traces endpoint to instrument
FastAPI requests with OpenTelemetry in the production profile.
