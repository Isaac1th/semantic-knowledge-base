import "dotenv/config";

import express from "express";

import { loadEnv } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.js";
import { createEmbeddingProvider } from "./modules/embeddings/index.js";
import { createDocumentService } from "./modules/documents/index.js";
import { createDocumentsRouter } from "./routes/documents.js";

const env = loadEnv();
const app = express();

app.use(express.json());

const embeddingProvider = createEmbeddingProvider(env);
const documentService = createDocumentService(embeddingProvider);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "semantic-knowledge-base-api" });
});

app.use("/api/documents", createDocumentsRouter(documentService));

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`);
});
