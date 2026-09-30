# MacBook Air M4 / 16GB runbook

This repository is copied without model weights. It runs immediately in
`mock` mode and can switch to `remote` mode when compatible model servers are
available.

## Validate the integration

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
PYTHONPATH=src python scripts/smoke_test.py
PYTHONPATH=src python scripts/api_smoke_test.py
```

## Connect the model endpoints

Copy `.env.example` to `.env`, set `CYBERAGENT_MODE=remote`, and configure the
four OpenAI-compatible endpoints:

```dotenv
CYBERAGENT_HANDLER_MODEL=muse-glimmer
CYBERAGENT_HANDLER_BASE_URL=http://127.0.0.1:11434/v1
CYBERAGENT_RED_TEAM_BASE_URL=http://127.0.0.1:11434/v1
CYBERAGENT_BLUE_TEAM_BASE_URL=http://127.0.0.1:11434/v1
CYBERAGENT_CODE_REVIEW_BASE_URL=http://127.0.0.1:11434/v1
```

The three specialist SLMs are Drana-Infinity, HOLAS Defender, and Qwen3.5
Abliterated. Muse Glimmer is the Handler and is outside the specialist count.
On a 16GB Mac, keep only one large model resident at a time or host the Handler
remotely.

For a live Ollama test, register the Muse Glimmer GGUF as `muse-glimmer`, then
pull only the three specialists:

```bash
ollama pull IHA089/drana-infinity-7b:7b
ollama pull achieversictclub/holas-defender-ultimate-v14-online:latest
ollama pull lukey03/qwen3.5-9b-abliterated:latest
```

Start the API and run the live contract evaluation:

```bash
PYTHONPATH=src uvicorn cyberagent.main:app --host 127.0.0.1 --port 8000
PYTHONPATH=src python scripts/evaluate_harness.py --live
```

Persistent Qdrant, Graphiti, and PostgreSQL services remain optional. Their
settings are documented in `.env.example`.
