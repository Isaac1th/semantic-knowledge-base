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

## Phase 2 status (current)

Infrastructure is in place:

- npm workspaces monorepo (`apps/api`, `apps/web`, `packages/shared`)
- Docker Compose PostgreSQL 16 with pgvector
- Migrations for `documents` and `document_chunks`
- pgvector smoke test (insert + cosine distance query)

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

### 7. Run the API (minimal health endpoint)

```bash
npm run dev:api
```

Visit `http://localhost:3001/health`.

### 8. Run the web app (placeholder UI)

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
| `npm test` | Run all workspace tests |
| `npm run db:up` | Start PostgreSQL container |
| `npm run db:down` | Stop PostgreSQL container |
| `npm run db:migrate` | Apply SQL migrations |
| `npm run db:seed` | Insert sample documents |
| `npm run db:smoke` | pgvector insert/query smoke test |
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
| 4. Embedding providers | Planned |
| 5. Document indexing | Planned |
| 6. Search | Planned |
| 7. Hybrid search | Planned |
| 8. React interface | Planned |
| 9. Evaluation metrics | Planned |
| 10. Review & RAG path | Planned |

## Common vector-search mistakes

1. **Mixing embedding models** — vectors from different models live in incompatible spaces; always filter by `embedding_model` and `embedding_dimensions`.
2. **Skipping chunking** — whole documents produce poor retrieval; chunk size and overlap matter.
3. **Using ANN too early** — approximate indexes trade recall for speed; learn exact search first.
4. **Comparing raw keyword and vector scores** — different scales; normalize or use rank fusion.
5. **Re-embedding unchanged text** — use content hashes to avoid redundant API calls.

## Extending to RAG

This schema already supports retrieval for RAG:

1. User query → embed query
2. Vector search → top-K chunks with metadata
3. Inject chunks into LLM prompt with citations
4. Optional reranking / query expansion in later iterations

No schema redesign is required.
