# Three-SLM quantization and compute guide

The runtime has one Handler and exactly three specialist SLMs. All four model
processes expose the same OpenAI-compatible endpoint contract, but only the
specialist selected for a request runs.

| Role | Model | Q4 size | Purpose |
|---|---|---:|---|
| Handler | Muse Glimmer 30B | about 18.2 GB | context enrichment and routing |
| Red team | Drana-Infinity 7B | about 4.7 GB | authorized offensive analysis |
| Blue team | HOLAS Defender | about 2.0 GB | defensive triage and remediation |
| Code review | Qwen3.5-9B Abliterated | about 5.6 GB | source review and secure patches |

Use Q4_K_M as the default deployment format. It offers a practical memory and
quality tradeoff for structured routing and technical generation. Validate the
exact artifact on the target hardware; quantization quality and memory usage
depend on the runtime, context length, and model architecture.

## Sequential execution

The Handler first produces a route decision. The runtime then invokes at most
one of the three specialists. On a constrained host, unload the Handler before
loading the specialist. With this policy, model-weight memory is bounded by the
largest loaded model rather than the sum of all models.

General informational requests stay with the Handler. Web research uses the
SearXNG worker and does not add a specialist model.

## Recommended runtime settings

- Keep one or two models loaded, depending on available memory.
- Use native JSON-schema or grammar-constrained output where supported.
- Set explicit context and output-token limits for every endpoint.
- Run `scripts/evaluate_harness.py --live` against the exact quantized
  artifacts before deployment.
- Measure routing accuracy, schema compliance, task quality, latency, and peak
  memory. Do not infer semantic accuracy from a successful schema check.

## Ollama specialist installation

```bash
ollama pull IHA089/drana-infinity-7b:7b
ollama pull achieversictclub/holas-defender-ultimate-v14-online:latest
ollama pull lukey03/qwen3.5-9b-abliterated:latest
```

Register the Muse Glimmer GGUF as `muse-glimmer` using
`scripts/download_active_models.sh` or an equivalent Modelfile.
