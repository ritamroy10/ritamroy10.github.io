# Model endpoint contract

Every model slot must expose an OpenAI-compatible
`POST /v1/chat/completions` endpoint. The application sends `model`,
`messages`, `temperature`, `max_tokens`, and a JSON-schema `response_format`.

## Endpoint slots

| Environment variable | Role | Default |
|---|---|---|
| `CYBERAGENT_HANDLER_BASE_URL` | Muse Glimmer handler | `http://127.0.0.1:8101/v1` |
| `CYBERAGENT_RED_TEAM_BASE_URL` | Drana-Infinity red-team SLM | `http://127.0.0.1:8102/v1` |
| `CYBERAGENT_BLUE_TEAM_BASE_URL` | HOLAS Defender blue-team SLM | `http://127.0.0.1:8103/v1` |
| `CYBERAGENT_CODE_REVIEW_BASE_URL` | Qwen3.5 Abliterated code-review SLM | `http://127.0.0.1:8105/v1` |

The specialist inventory contains exactly three SLMs. General informational
requests are answered by the Handler, and web research uses the SearXNG worker.
The model process may be llama.cpp, vLLM, Ollama, LM Studio, or a remote
service; the harness depends only on the endpoint contract.

## Model response requirements

The Handler returns a `RouteDecision` JSON object. A specialist returns a
`SpecialistResult` JSON object. If a server cannot enforce JSON schema, the
gateway can extract a JSON object from a fenced response, but production
endpoints should support native structured output.
