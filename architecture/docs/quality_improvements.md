# Quality and latency improvements — A6000 RunPod profile

The RunPod profile targets the requested RTX A6000 (48 GB VRAM, 60 GB RAM).
It allows the handler and one specialist to stay loaded. Only the selected
specialist runs; switching specialist routes unloads the preceding specialist.
Ollama can still evict models when it needs memory. Live measurements establish
actual residency and latency.

## Implemented

- Response timing for retrieval, handler plus loading, specialist plus loading,
  first answer token, memory submission, and total latency. Model-switch events
  separately record loading time. Metrics include bounded p50/p95/p99 samples.
- Handler clarification questions and structured schema validation; file contents
  are evidence, and ambiguous user requests should trigger clarification.
- Source-section review for large attachments and pasted code. Every section is
  processed by the same selected SLM. Findings are consolidated with source line
  references. Explicit limits reject oversized reviews instead of silently
  reviewing only the beginning. This does not prove whole-program dataflow.
- Evidence citations limited to supplied source URLs or retrieved web records,
  unsupported findings labelled as hypotheses, and no blanket trust of arbitrary
  model-provided tool labels. This is evidence validation, not a factuality proof.
- Atomic, flushed persistence journals and periodic in-process retries. Unavailable
  persistent destinations keep their journals for replay. Delivery is at least once:
  graph/audit records may duplicate on partial failure; exact-once delivery is not
  claimed. Test destination recovery against real services before production.
- Progress keeps streamed text visible during validation. Final responses show
  elapsed time. Section reviews report completed section counts.
- A read-only complete corpus payload/dimension audit with optional known-document
  retrieval tests. Embedding identity still needs the ingestion manifest.
- Twenty new draft evaluation cases covering specialist routing, source uploads,
  follow-up memory, ambiguity, and web routing. These supplement the original ten.
  Human review of acceptance labels and answer correctness remains necessary.

## Run and preserve results

Local verification: the full suite passed 91 tests before the final routing
regressions were added. The extended mock evaluation passes 19/20 cases; the
remaining case requires a meaningful follow-up answer containing a remembered
deployment name, which the mock specialist does not produce. This failure stays
visible and must be checked with live models; it is not waived as a passing test.

```bash
python -m pytest -q
python scripts/evaluate_harness.py --live > data/evaluation-live.json
python scripts/evaluate_harness.py --live --cases config/evaluations_extended.yaml > data/evaluation-extended-live.json
python scripts/validate_corpus.py --queries config/corpus_checks.yaml
```

Create `config/corpus_checks.yaml` from real documents:

```yaml
cases:
  - query: A question answered by a known document
    tenant_id: default
    expected_source_id: actual-ingested-document-id
```

Run the live set twice to compare cold and warm behavior. Use isolated session IDs
and inspect `/v1/metrics?include_events=true` with the configured API key. Confirm
the handler is invoked, one specialist is selected, known evidence is retrieved,
facts survive restart, and failed writes replay after service recovery. Repeat
with concurrent tenants before claiming a production throughput figure.
