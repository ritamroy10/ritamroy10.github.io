# RunPod GPU end-to-end runbook

Read [the current validation status](runpod_validation_status.md) first.
Use Python 3.12+. Full functionality requires real persistent services and corpus
migration in addition to the default model-only profile.

This runbook assumes the Windows laptop is only used to upload/download files.
The API, Ollama, and live model calls run inside a Linux RunPod Pod.

After Ollama is installed, download Muse Glimmer and the three active
specialists with:

```bash
cd /workspace/ARCHITECHTURE
bash scripts/download_active_models.sh
```

The installer resumes interrupted handler downloads and fails if any required
model is missing. The A6000 profile allows the handler and one specialist to stay
loaded. Only the specialist selected by Muse Glimmer executes for each request.

## 1. Persistent workspace

Attach a Network Volume or use `/workspace` for the project, Ollama models,
logs, and evaluation reports. Do not keep important data only on temporary
container storage.

## 2. Automated Deployment from Antigravity IDE

From PowerShell on your host machine:

```powershell
.\scripts\runpod_deploy.ps1 -SshCommand "ssh root@<IP> -p <PORT> -i ~/.ssh/runpod_architecture"
.\scripts\runpod_control.ps1 -HostName <IP> -Port <PORT> -Action bootstrap
```

This packages the core project, transfers it to `/workspace/ARCHITECHTURE`, bootstraps the Python virtual environment, installs dependencies, launches Ollama, pulls the pilot models, and runs preflight verification.
The deployment archive excludes the workstation `.env`. During bootstrap, a
stale mock-mode `.env` is backed up and replaced with the RunPod profile.

### Manual Alternative: Install the project and Ollama

```bash
mkdir -p /workspace/ollama-models
export OLLAMA_MODELS=/workspace/ollama-models
export OLLAMA_MAX_LOADED_MODELS=2
export OLLAMA_NUM_PARALLEL=1
export OLLAMA_KEEP_ALIVE=0
export OLLAMA_CONTEXT_LENGTH=4096

curl -fsSL https://ollama.com/install.sh | sh
ollama serve > /workspace/ollama.log 2>&1 &
```

Keep Ollama and the API on `127.0.0.1` when they run in the same Pod. Do not
expose an unauthenticated Ollama port to the public internet.

## 3. Pull and verify models

Pull the three specialist SLMs:

```bash
ollama pull achieversictclub/holas-defender-ultimate-v14-online:latest
ollama pull IHA089/drana-infinity-7b:7b
ollama pull lukey03/qwen3.5-9b-abliterated:latest
```

The active workflow requires Muse Glimmer as the Handler plus Drana-Infinity,
HOLAS Defender, and Qwen3.5 Abliterated as the three specialist SLMs.

## 4. Run preflight

```bash
export PYTHONPATH=src
python scripts/runpod_preflight.py
```

The preflight checks the registered tools and every enabled model exposed by
the configured OpenAI-compatible `/v1/models` endpoints. It also reports the
optional Qdrant, Neo4j, PostgreSQL, and SearXNG service status.

## 5. Start and test the API

Terminal 1:

```bash
export PYTHONPATH=src
uvicorn cyberagent.main:app --host 127.0.0.1 --port 8000
```

Terminal 2:

```bash
source .venv/bin/activate
export PYTHONPATH=src
python scripts/evaluate_harness.py --live --cases config/evaluations_pilot.yaml
```

Only after the pilot passes:

```bash
python scripts/evaluate_harness.py --live
```

## 6. Optional persistent services

Set these only after the services are actually reachable:

```dotenv
CYBERAGENT_MEMORY_BACKEND=qdrant
CYBERAGENT_GRAPH_BACKEND=graphiti
CYBERAGENT_AUDIT_BACKEND=postgres
CYBERAGENT_EMBEDDING_BACKEND=openai_compatible
```

The embedding model and its dimension must match the configured Qdrant
collection. The sandbox remains disabled until a separate gVisor or
Firecracker executor is deployed; then configure its URL, token, and command
allowlist. The API process does not execute arbitrary local shell commands.

## 7. Save results and transfer

Stop model serving before copying the model cache. Archive the project and
model directory separately; do not include `.venv`, secrets, or logs containing
sensitive data unless intentionally retained.

```bash
cd /workspace
tar -I 'zstd -3' -cf architecture-results.tar.zst ARCHITECHTURE
tar -I 'zstd -1' -cf ollama-models.tar.zst ollama-models
```

Use `runpodctl`, SCP, rsync, or cloud storage for large transfers.
