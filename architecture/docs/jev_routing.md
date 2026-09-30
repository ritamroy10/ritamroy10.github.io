# Jev routing integration

Jev is an optional decision layer in front of the existing handler router. It chooses one
bounded route and returns a confidence score. Specialist models, policy enforcement, tool
authorization, retrieval, validation, and response generation remain unchanged.

## Modes

Set `CYBERAGENT_JEV_ROUTING_MODE` to one of:

- `disabled` (default): only the existing handler router runs.
- `shadow`: Jev and the handler run concurrently. The handler decision is always used, while
  route agreement, confidence, latency, and token usage are recorded.
- `active`: a valid Jev route at or above `CYBERAGENT_JEV_MIN_ROUTE_CONFIDENCE` is used. The
  existing handler is called when Jev is unavailable, uncertain, malformed, or conflicts with
  deterministic intent checks.

Jev never grants tool permissions. `RouteValidator` continues to intersect route tool requests
with policy permissions and continues to require authorization for red-team execution.

## Configuration

Create a server-side TypeSafe API key and configure:

```dotenv
CYBERAGENT_JEV_ROUTING_MODE=shadow
CYBERAGENT_JEV_API_KEY=<server-side-key>
CYBERAGENT_JEV_MODEL=jev-1.13.0
CYBERAGENT_JEV_MIN_ROUTE_CONFIDENCE=0.70
```

`TYPESAFE_API_KEY` is accepted as an alternative key name. Keep the key out of browser code and
source control. Pinning `jev-1.13.0` keeps evaluation thresholds stable; change the version only
after re-running the routing evaluation.

The integration sends the current request and a bounded conversation history. Retrieved
documents and graph facts are excluded from Jev state to reduce irrelevant context and indirect
prompt-injection exposure.

## Rollout and measurement

Start in `shadow` mode and inspect `GET /v1/metrics?include_events=true`. The following events are
emitted without request content or credentials:

- `jev_routing_call`: success, failure, and latency
- `jev_shadow_comparison`: Jev/handler agreement, routes, confidence, and input-token usage
- `jev_route_selected`: active decisions and usage
- `jev_route_fallback`: low-confidence, request-error, or deterministic-conflict fallbacks

Evaluate a held-out, human-labeled routing set before activating Jev. Measure route accuracy by
route, low-confidence coverage, handler agreement, fallback rate, p50/p95 latency, token cost, and
downstream completion quality. Choose the confidence threshold from this evaluation rather than
assuming the default is optimal.

The existing evaluation harness reports those Jev counters alongside route accuracy, latency,
guardrail accuracy, grounding, and end-to-end pass rate:

```powershell
$env:TYPESAFE_API_KEY = "<server-side-key>"
python scripts/testing/evaluate_harness.py --jev-mode shadow
python scripts/testing/evaluate_harness.py --jev-mode active --jev-min-confidence 0.80
```

When the acceptance criteria are met, switch to `active`. Continue monitoring fallback rate and
downstream quality, and return to `shadow` if the model version or routing criteria change.
