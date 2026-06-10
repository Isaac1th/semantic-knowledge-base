# Semantic Knowledge Base

A full-stack semantic search system built on **text embeddings** and **pgvector**. Store documents and notes, then search them by meaning (semantic similarity), keywords, or a hybrid of both — the same retrieval pattern used in production RAG pipelines.

## Technical highlights

- Dense vector search using cosine similarity, dot product, and Euclidean distance
- Text chunking pipeline with configurable size, overlap, and content-hash deduplication
- Hybrid ranking combining vector scores and keyword relevance (BM25-style)
- Metadata filters on top of vector queries for precision retrieval
- Switchable embedding providers (mock for development, OpenAI in production)
- Schema designed as a drop-in retrieval layer for RAG — no redesign required
- Evaluation metrics for measuring retrieval quality (Phase 9)

## Architecture overview

```
apps/
  api/     Express + TypeScript backend
  web/     React + TypeScript frontend (Phase 8)
packages/
  shared/  Shared types, schemas, and vector math
docker/    PostgreSQL + pgvector via Docker Compose
migrations/ SQL schema migrations
seeds/     Sample documents
```

```mermaid
sequenceDiagram
  participant Doc as Document
  participant Chunk as Chunking
  participant Emb as Embedding API
  participant DB as pgvector

  Doc->>Chunk: normalize + split
  Chunk->>Emb: chunk texts (batch)
  Emb->>DB: store chunks + embeddings + metadata
```

```mermaid
sequenceDiagram
  participant Query as Search Query
  participant Emb as Embedding API
  participant DB as pgvector
  participant Rank as Ranking

  Query->>Emb: embed query
  Emb->>DB: compare query vector to stored vectors
  DB->>Rank: distances + metadata filters
  Rank->>Query: ranked chunk results
```

## How embeddings work here

1. Document text is normalized and split into chunks.
2. Each chunk is sent to the active embedding provider (`mock` or `openai`).
3. The provider returns a dense vector (default 1536 dimensions).
4. Vectors are stored in PostgreSQL using the pgvector `vector` type.
5. Search embeds the query with the **same model** and compares vectors using cosine distance.

The mock provider is deterministic (SHA-256 seeded) for tests. OpenAI provides real semantic similarity when `EMBEDDING_PROVIDER=openai`.

## Indexing flow

1. `POST /api/documents` validates input with Zod.
2. Text is normalized and hashed (`content_hash`).
3. Chunking splits content (default: 500 chars, 50 overlap).
4. Chunks are embedded in batch via the provider.
5. A transaction deletes old chunks and inserts new rows with denormalized metadata.
6. Updates skip re-indexing when the content hash is unchanged.

Re-index manually with `POST /api/documents/:id/reindex`.

## Search flow

1. Client sends query + optional filters (`category`, `tags`, `topK`, `threshold`).
2. Vector/hybrid modes embed the query server-side.
3. PostgreSQL runs FTS (`keyword`) or pgvector exact NN (`vector`).
4. Hybrid mode merges keyword + vector scores with configurable weights.
5. API returns chunk text, document metadata, scores, and debug fields (embedding preview).

## Example API usage

```bash
# Create and index a document
curl -X POST http://localhost:3001/api/documents \
  -H "Content-Type: application/json" \
  -d '{"title":"Password help","content":"Long enough content for chunk indexing...","category":"support","tags":["auth"]}'

# Vector search
curl -X POST http://localhost:3001/api/search/vector \
  -H "Content-Type: application/json" \
  -d '{"query":"I forgot my password","topK":5}'

# Hybrid search
curl -X POST http://localhost:3001/api/search/hybrid \
  -H "Content-Type: application/json" \
  -d '{"query":"login credentials","topK":5,"vectorWeight":0.7,"keywordWeight":0.3}'

# Run evaluation metrics (requires seeded + indexed documents)
curl -X POST http://localhost:3001/api/evaluation/run \
  -H "Content-Type: application/json" \
  -d '{"topK":5}'
```

## Example searches (learning)

After `npm run db:seed`, create/index documents via the UI or API, then try:

| Query | Expected behavior |
|-------|-------------------|
| `I forgot my password` | Vector search should rank password/login docs above weather |
| `sunny weather` | Keyword search strongly favors the weather document |
| `login credentials` + `category=support` | Metadata filter narrows results to support docs |

## Prerequisites

- Node.js 20+
- Docker Desktop (or Docker Engine + Compose)
- npm

## Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

### 3. Start PostgreSQL

```bash
npm run db:up
```

Wait until the container is healthy:

```bash
docker compose -f docker/docker-compose.yml ps
```

### 4. Run migrations

```bash
npm run db:migrate
```

### 5. Seed sample documents (optional)

```bash
npm run db:seed
```

### 6. Verify pgvector

```bash
npm run db:smoke
```

### 7. Run the API

```bash
npm run dev:api
```

Visit `http://localhost:3001/health`.

### 8. Run the web app

```bash
npm run dev:web
```

Visit `http://localhost:5173`.

## Database setup

Connection string (default):

```
postgresql://skb:skb@localhost:5432/semantic_kb
```

### Tables

**`documents`** — source notes/documents (title, content, category, tags, content_hash)

**`document_chunks`** — chunked text with pgvector embeddings and denormalized metadata for fast search/filtering

### Vector index strategy

Phase 2 uses **exact nearest-neighbor search** (no ANN index yet).

| Approach | Description | When |
|----------|-------------|------|
| Exact NN | Compare query to every vector | Phase 6 (baseline) |
| IVFFlat | Partitioned approximate index | Larger datasets |
| HNSW | Graph-based approximate index | Production scale |

ANN indexes (HNSW/IVFFlat) are introduced after baseline exact search is validated, so index tuning decisions are grounded in measured recall/latency trade-offs.

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | (required) | PostgreSQL connection string |
| `PORT` | `3001` | API port |
| `NODE_ENV` | `development` | Runtime environment |
| `EMBEDDING_PROVIDER` | `mock` | `mock` or `openai` (later phases) |
| `OPENAI_API_KEY` | — | Server-side only; never expose to React |
| `EMBEDDING_MODEL` | `text-embedding-3-small` | Embedding model name |
| `EMBEDDING_DIMENSIONS` | `1536` | Vector dimensions |
| `VITE_API_URL` | `http://localhost:3001` | Web app API base URL |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Build all workspaces |
| `npm test` | Run unit tests (excludes DB integration tests) |
| `npm run db:smoke` | pgvector smoke test (requires database) |
| `npm run test:integration -w @skb/api` | Document indexing integration test |
| `npm run db:up` | Start PostgreSQL container |
| `npm run db:down` | Stop PostgreSQL container |
| `npm run db:migrate` | Apply SQL migrations |
| `npm run db:seed` | Insert sample documents |
| `npm run dev:api` | Start API in watch mode |
| `npm run dev:web` | Start Vite dev server |

## Git workflow (trunk-based)

- Primary branch: `main`
- Short-lived branches from latest `main`, e.g. `chore/docker-setup`
- Small, focused commits with conventional messages
- Merge frequently; do not commit directly to `main`

## Roadmap

| Phase | Status |
|-------|--------|
| 1. Architecture & design | Complete |
| 2. Local infrastructure | Complete |
| 3. Vector mathematics | Complete |
| 4. Embedding providers | Complete |
| 5. Document indexing | Complete |
| 6. Search | Complete |
| 7. Hybrid search | Complete |
| 8. React interface | Complete |
| 9. Evaluation metrics | Complete |
| 10. Review & RAG path | Complete |

## Evaluation metrics

The evaluation endpoint (`POST /api/evaluation/run`) runs vector search against [`seeds/evaluation-dataset.json`](seeds/evaluation-dataset.json) and reports:

- **Precision@K** — Of the top K results, what fraction are relevant?
- **Recall@K** — Of all relevant documents, what fraction appear in the top K?
- **Mean Reciprocal Rank (MRR)** — How highly ranked is the first relevant hit? (1/rank, averaged across queries)

These metrics are educational baselines on a tiny dataset, not production benchmarks.

## Hybrid search limitations

The hybrid endpoint uses **per-request min-max normalization** followed by a weighted sum (`vectorWeight * normVector + keywordWeight * normKeyword`). This is easy to understand but imperfect:

- Vector and keyword scores live on different scales; normalization is a rough alignment hack.
- If one side returns few or no hits, combined ranking can be biased.
- Production systems often prefer **Reciprocal Rank Fusion (RRF)**, learned re-rankers, or cross-encoders instead.

## Common vector-search mistakes

1. **Mixing embedding models** — vectors from different models live in incompatible spaces; always filter by `embedding_model` and `embedding_dimensions`.
2. **Skipping chunking** — whole documents produce poor retrieval; chunk size and overlap matter.
3. **Using ANN too early** — approximate indexes trade recall for speed; learn exact search first.
4. **Comparing raw keyword and vector scores** — different scales; normalize or use rank fusion.
5. **Re-embedding unchanged text** — use content hashes to avoid redundant API calls.

## Architecture review (Phase 10)

### Strengths

- Clear module boundaries (`documents`, `chunking`, `embeddings`, search modules).
- Vector math and SQL distance operators remain visible (educational).
- Model isolation enforced in SQL (`embedding_model`, `embedding_dimensions`).
- Content-hash deduplication avoids redundant embedding calls.
- Zod validation on all API inputs; API keys never exposed to React.

### Security notes

- **No authentication** — acceptable for local learning; add auth before any public deployment.
- **CORS is open (`*`)** — convenient for local dev; restrict origins in production.
- **Parameterized SQL** — all queries use bound parameters (no string concatenation of user input).
- **OpenAI key** — server-side only via `OPENAI_API_KEY`; never commit `.env`.

### Performance notes

- Vector search uses **exact nearest neighbor** (O(n) scan). Fine for learning datasets; add HNSW/IVFFlat when chunk count grows.
- Denormalized chunk metadata avoids JOINs on every search.
- Embedding batching reduces API round-trips during indexing.

### Suggested improvements

- Add HNSW index after measuring exact-search latency/recall trade-offs.
- Replace min-max hybrid fusion with Reciprocal Rank Fusion (RRF).
- Add authentication, rate limiting, and stricter CORS for production.
- Add a reranker or cross-encoder for higher-precision top results.

## Extending to RAG

This project is already a retrieval layer. To evolve into RAG:

```mermaid
sequenceDiagram
  participant User
  participant API as Retrieval API
  participant LLM as LLM Service

  User->>API: query
  API->>API: embed + vector search topK
  API-->>User: ranked chunks + citations
  User->>LLM: prompt with injected chunks
  LLM-->>User: grounded answer with sources
```

Steps:

1. Reuse `POST /api/search/vector` or hybrid search for top-K chunk retrieval.
2. Build a prompt template that injects `chunkText`, `documentTitle`, and `documentId`.
3. Call an LLM with citations linking back to `documents`.
4. Optional next iterations: query expansion, conversational history, reranking, answer validation.

No schema redesign is required — `document_chunks` already stores everything needed for grounded generation.
