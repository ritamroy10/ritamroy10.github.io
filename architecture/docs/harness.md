# AI harness contract

Every model-role pair in `config/models.yaml` is wrapped by the same
`SpecialistHarness`. Disabled or evaluation-only entries have a profile and
prompt, but the registry gate prevents execution until they are explicitly
enabled.

| Layer | Implementation | Contract |
|---|---|---|
| Inputs and prompts | `src/cyberagent/harness/prompting.py` | Authorization, scope, user request, and bounded untrusted context are separated and labeled. |
| Tools and APIs | `src/cyberagent/tools/registry.py`, `src/cyberagent/tools/broker.py` | Capability classes, allowlists, approval checks, bounded execution, and evidence-returning results. |
| Memory or context | `src/cyberagent/memory/context_broker.py`, `src/cyberagent/memory/stores.py` | Tenant isolation plus session-scoped conversation memory; documents remain tenant-shared. |
| Guardrails | `src/cyberagent/policy.py`, `src/cyberagent/routing.py`, `src/cyberagent/harness/guardrails.py`, `src/cyberagent/harness/validation.py`, `src/cyberagent/validation.py` | Credential blocking, authorization gates, route/model validation, citation filtering, and output redaction. |
| Evaluation | `src/cyberagent/evaluation.py`, `config/evaluations.yaml` | Deterministic route, status, guardrail, model-selection, and harness-coverage checks. |
| Logging and monitoring | `src/cyberagent/observability.py`, `GET /v1/metrics` | Structured redacted lifecycle events, request/model/tool counters, and duration summaries. |
| Execution control | `src/cyberagent/execution.py`, `src/cyberagent/model_gateway.py` | Total model/tool timeouts, configurable retries/backoff, bounded tool steps, and normalized failures. |

## Lifecycle

1. The policy gate validates the request and authorization scope.
2. The context broker retrieves tenant/session-safe context.
3. Muse selects one route; the deterministic validator selects an enabled model.
4. The specialist harness assembles the prompt, calls the model, and executes only broker-approved tools.
5. Evidence and output guardrails validate and redact the result.
6. The orchestrator records lifecycle metrics, persists redacted memory/audit data, and returns HTTP, SSE, or WebSocket output.

Run the offline evaluation suite with:

```bash
PYTHONPATH=src python scripts/evaluate_harness.py
```
