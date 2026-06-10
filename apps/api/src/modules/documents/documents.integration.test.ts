import "dotenv/config";

import { afterAll, describe, expect, it } from "vitest";

import { closePool } from "../../db/pool.js";
import { DeterministicMockEmbeddingProvider } from "../embeddings/mock-provider.js";
import { DocumentService } from "./service.js";
import { getPool } from "../../db/pool.js";

describe("DocumentService integration", () => {
  const pool = getPool();
  const service = new DocumentService(
    pool,
    new DeterministicMockEmbeddingProvider(1536),
  );

  afterAll(async () => {
    await closePool();
  });

  it("creates, indexes, and deletes a document transactionally", async () => {
    const created = await service.createDocument({
      title: "Integration test document",
      content:
        "This document is long enough to produce at least one chunk for indexing verification in the test database environment.",
      category: "technical",
      tags: ["integration"],
    });

    expect(created.indexed).toBe(true);
    expect(created.chunkCount).toBeGreaterThan(0);
    expect(created.document.chunkCount).toBe(created.chunkCount);

    const fetched = await service.getDocument(created.document.id);
    expect(fetched.title).toBe("Integration test document");

    await service.deleteDocument(created.document.id);
    await expect(service.getDocument(created.document.id)).rejects.toThrow(
      /not found/,
    );
  });
});
