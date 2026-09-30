# System Architecture & Codebase Map

This document outlines the codebase organization, module boundaries, and design patterns across the Cybersecurity SLM Harness project.

## Directory Layout

```
D:\ARBOOD\ARCHITECHTURE\
+-- config/                 # YAML configs (routing, models, policies, eval cases)
+-- data/                   # Runtime & data directory
+-- docs/                   # Architecture documentation, runbooks, guides
+-- prompts/                # Role-specific system prompt templates
+-- rag/                    # Pre-indexed local Qdrant database & corpus files
+-- scripts/                # Operational and development utilities
¦   +-- benchmarks/         # Multi-tier quality benchmarks
¦   +-- models/             # Model server helpers (Ollama, llama.cpp, RunPod)
¦   +-- rag/                # Vector DB ingestion, CRUD, and semantic search
¦   +-- testing/            # Smoke tests, API tests, harness evaluators
+-- src/cyberagent/         # Core Python package
¦   +-- contracts.py        # Pydantic schemas and protocol models
¦   +-- config.py           # Environment and runtime settings
¦   +-- orchestrator.py     # Request lifecycle coordinator
¦   +-- routing.py          # Intent classification and route selection
¦   +-- model_gateway.py    # Multi-backend LLM inference gateway
¦   +-- runtime.py          # ContextBroker, Registry, and service container
¦   +-- memory/             # Storage adapters
¦   ¦   +-- embeddings.py   # Embedding providers (Hash, FastEmbed, OpenAI)
¦   ¦   +-- vector_stores.py# Vector database adapters (InMemory, Qdrant)
¦   ¦   +-- graph_stores.py # Knowledge graph adapters (InMemory, Graphiti)
¦   ¦   +-- audit_stores.py # Audit log stores (InMemory, Postgres)
¦   ¦   +-- stores.py       # Backward-compatibility re-export shim
¦   +-- harness/            # Specialist agent harness execution
¦   +-- tools/              # Tool registry and security tools
+-- tests/                  # Automated pytest test suite
¦   +-- conftest.py         # Shared test fixtures (mock settings & runtime)
+-- tools/                  # Declarative tool manifests & schemas
```

## Storage Layer (`cyberagent.memory`)

The memory layer is decomposed into four single-responsibility submodules:

| Submodule | Implementations | Purpose |
|---|---|---|
| `embeddings.py` | `HashEmbeddingProvider`<br>`FastEmbedProvider`<br>`OpenAICompatibleEmbeddingProvider` | Computes text vectors across offline (128d), local ONNX (384d), and remote APIs |
| `vector_stores.py` | `InMemoryVectorStore`<br>`QdrantVectorStore` | Manages vector indexing, payload storage, and cosine similarity search |
| `graph_stores.py` | `InMemoryGraphStore`<br>`GraphitiStore` | Manages entity-relationship knowledge graph retrieval |
| `audit_stores.py` | `InMemoryAuditStore`<br>`PostgresAuditStore` | Compliance and observability audit trail persistence |
| `stores.py` | Re-exports all of the above | Preserves 100% backward compatibility for existing imports |

## Scripts Hierarchy & Dual Invocation

All operations can be called either through the classified subdirectory or directly from `scripts/`:

```bash
# Both invocations are identical:
python scripts/rag/query_rag.py -q "What is CVE-2024-21413?"
python scripts/query_rag.py -q "What is CVE-2024-21413?"
```

