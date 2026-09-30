# Linux server deployment runbook

Run these commands after copying the project to `/opt/cyberagent` (adjust the
path if needed). The commands are intentionally explicit so a clean server can
be reproduced without RunPod-specific assumptions.

```bash
cd /opt/cyberagent
sudo apt-get update
sudo apt-get install -y python3.12-venv curl
python3 -m venv .venv
. .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
pip install -e '.[production]'
cp .env.example .env
```

Set these values in `.env`:

```dotenv
CYBERAGENT_MODE=ollama
CYBERAGENT_PROVIDER=ollama
CYBERAGENT_MEMORY_BACKEND=qdrant
CYBERAGENT_GRAPH_BACKEND=graphiti
CYBERAGENT_OLLAMA_BASE_URL=http://127.0.0.1:11434
CYBERAGENT_QDRANT_URL=http://127.0.0.1:6333
CYBERAGENT_GRAPH_LLM_BASE_URL=http://127.0.0.1:11434/v1
CYBERAGENT_GRAPH_LLM_MODEL=muse-glimmer
CYBERAGENT_GRAPH_EMBEDDING_BASE_URL=http://127.0.0.1:11434/v1
CYBERAGENT_GRAPH_EMBEDDING_MODEL=nomic-embed-text
CYBERAGENT_GRAPH_EMBEDDING_DIMENSIONS=768
```

Start the API only after Ollama, Qdrant, and Neo4j are healthy:

```bash
ollama list
curl -fsS http://127.0.0.1:6333/healthz
curl -fsS http://127.0.0.1:7474
python -m uvicorn cyberagent.main:app --host 0.0.0.0 --port 8000
```

Verify the workflow from another shell:

```bash
curl -fsS http://127.0.0.1:8000/health
cat >/tmp/review.json <<'JSON'
{"message":"Review this Python Flask login code for SQL injection and unsafe password handling: query = SELECT concatenated with request.args[name]; cursor.execute(query)"}
JSON
curl -fsS -X POST http://127.0.0.1:8000/v1/chat \
  -H 'content-type: application/json' --data-binary @/tmp/review.json
```

The response must show `route: "code_review"` and a single selected model.
