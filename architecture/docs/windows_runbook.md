# Windows 10/11 live Ollama runbook

Install Ollama for Windows, then verify it from PowerShell:

```powershell
ollama --version
ollama list
```

For constrained machines, set one loaded model and one request at a time, then
restart Ollama:

```powershell
[Environment]::SetEnvironmentVariable("OLLAMA_MAX_LOADED_MODELS", "1", "User")
[Environment]::SetEnvironmentVariable("OLLAMA_NUM_PARALLEL", "1", "User")
[Environment]::SetEnvironmentVariable("OLLAMA_KEEP_ALIVE", "0", "User")
[Environment]::SetEnvironmentVariable("OLLAMA_CONTEXT_LENGTH", "2048", "User")
```

Register the Muse Glimmer GGUF as `muse-glimmer`, then download the three
specialist SLMs:

```powershell
ollama pull IHA089/drana-infinity-7b:7b
ollama pull achieversictclub/holas-defender-ultimate-v14-online:latest
ollama pull lukey03/qwen3.5-9b-abliterated:latest
```

Create the environment and install the project:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -e ".[dev]"
Copy-Item .env.example .env
```

Use one Ollama server for the Handler and all three specialists:

```dotenv
CYBERAGENT_MODE=remote
CYBERAGENT_HANDLER_MODEL=muse-glimmer
CYBERAGENT_HANDLER_BASE_URL=http://127.0.0.1:11434/v1
CYBERAGENT_RED_TEAM_BASE_URL=http://127.0.0.1:11434/v1
CYBERAGENT_BLUE_TEAM_BASE_URL=http://127.0.0.1:11434/v1
CYBERAGENT_CODE_REVIEW_BASE_URL=http://127.0.0.1:11434/v1
```

Start the API and run contract evaluation in a second PowerShell window:

```powershell
$env:PYTHONPATH = "src"
uvicorn cyberagent.main:app --host 127.0.0.1 --port 8000
python scripts\evaluate_harness.py --live
```

The evaluator checks routing, model selection, guardrails, error handling, and
harness coverage. Human-reviewed golden answers are still required to measure
semantic cybersecurity accuracy.
