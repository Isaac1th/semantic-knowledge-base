import "dotenv/config";

import express from "express";

import { loadEnv } from "./config/env.js";
import { getPool } from "./db/pool.js";
import { errorHandler } from "./middleware/error-handler.js";
import { createEmbeddingProvider } from "./modules/embeddings/index.js";
import { ExperimentsService } from "./modules/experiments/service.js";
import { createDocumentService } from "./modules/documents/index.js";
import { HybridSearchService } from "./modules/hybrid-search/service.js";
import { KeywordSearchService } from "./modules/keyword-search/service.js";
import { VectorSearchService } from "./modules/vector-search/service.js";
import { createDocumentsRouter } from "./routes/documents.js";
import {
  createExperimentsRouter,
  createSearchRouter,
} from "./routes/search.js";

const env = loadEnv();
const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
});

app.use(express.json());

const pool = getPool();
const embeddingProvider = createEmbeddingProvider(env);
const documentService = createDocumentService(embeddingProvider);
const keywordSearchService = new KeywordSearchService(pool);
const vectorSearchService = new VectorSearchService(pool, embeddingProvider);
const hybridSearchService = new HybridSearchService(
  keywordSearchService,
  vectorSearchService,
);
const experimentsService = new ExperimentsService(pool, embeddingProvider);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "semantic-knowledge-base-api" });
});

app.use("/api/documents", createDocumentsRouter(documentService));
app.use(
  "/api/search",
  createSearchRouter({
    keywordSearch: keywordSearchService,
    vectorSearch: vectorSearchService,
    hybridSearch: hybridSearchService,
    experiments: experimentsService,
  }),
);
app.use("/api/experiments", createExperimentsRouter(experimentsService));

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`);
});
