# RunPod validation review — 2026-09-15

The repository is suitable for staged GPU testing, not yet certified for full
production functionality. Local mock tests do not measure model quality,
GPU latency, actual artifact availability, or database persistence.

## Corrections made

- Require Python 3.12+ and stop bootstrap if production dependencies fail.
- Install missing FastEmbed and OTLP packages with either install method.
- Require the handler, disable default fallback, and verify its installed name.
- Retry incomplete handler downloads and fail unsuccessful model warm-up.
- Use one bind configuration for startup and authentication; default to an SSH tunnel.
- Replace the Neo4j handshake simulator setup with real infrastructure.
- Return unavailable readiness when Graphiti falls back to memory.
- Remove database port collisions and bind infrastructure to loopback.
- Preserve environment overrides ahead of stale dotenv registry values.
- Exclude local conversation data, snapshots, and dotenv backups from deployment.

## RunPod test sequence

1. Use a Python 3.12+ GPU image. Upload with `scripts/runpod_deploy.ps1`.
2. Run `bash scripts/runpod_bootstrap.sh`. Every required model must install.
3. Run `bash scripts/start_runpod_server.sh` in a persistent terminal.
4. From Windows use `ssh -N -L 8000:127.0.0.1:8000 -p PORT USER@HOST`.
   Open `http://localhost:8000/chat`.
5. Run `python scripts/evaluate_harness.py --live` and retain the report.
6. Test each specialist, uploaded code, ambiguous routing, follow-up questions,
   streaming, tenant separation, and failure/retry behavior.
7. Enable real Qdrant, Neo4j/Graphiti, relational storage and web search. On a
   Docker-capable host use `scripts/setup_runpod_services.sh`; provide
   `NEO4J_PASSWORD` and `POSTGRES_PASSWORD` first. Pods without Docker require
   separately hosted services. Configure SearXNG to allow JSON search results.
8. Import the real corpus separately using its original embedding model and
   vector dimensions. Verify retrieval against known documents. Do not treat
   the default in-memory/hash profile as a complete RAG deployment.
9. Install the configured Graphiti embedding model and verify a stored fact
   survives service restart. TCP port reachability alone is insufficient.
10. Check cold and warm latency, GPU offload, peak VRAM, and answer quality on
    a reviewed prompt set. The roughly 17 GB handler artifact cannot fully fit
    within a 16 GB GPU alongside inference buffers; measure CPU offload or use
    a larger GPU. Do not infer production speed from mock timings.

Tencent managed databases need real credentials and endpoints. Sandbox execution
requires a separate executor. Those services are not provisioned by adapter code.
The default RunPod profile intentionally tests model orchestration first.

Remaining limitations: broad legacy-script lint findings; database recovery and
fallback reconciliation need live outage tests; model artifact integrity and
accuracy need live verification. No current RunPod connection was used in this
local review.
