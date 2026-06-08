import "dotenv/config";

import { randomUUID } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { closePool, getPool } from "./pool.js";

const EMBEDDING_DIMENSIONS = 1536;

function buildVector(seed: number): number[] {
  const vector = new Array<number>(EMBEDDING_DIMENSIONS);

  for (let index = 0; index < EMBEDDING_DIMENSIONS; index += 1) {
    vector[index] = Math.sin(seed + index * 0.01);
  }

  return vector;
}

function toPgVectorLiteral(values: number[]): string {
  return `[${values.join(",")}]`;
}

describe("pgvector smoke test", () => {
  beforeAll(async () => {
    const pool = getPool();
    const extension = await pool.query<{ extname: string }>(
      "SELECT extname FROM pg_extension WHERE extname = 'vector'",
    );

    expect(extension.rows).toHaveLength(1);
  });

  afterAll(async () => {
    await closePool();
  });

  it("inserts and queries vectors using cosine distance", async () => {
    const pool = getPool();
    const documentId = randomUUID();
    const chunkId = randomUUID();

    const vectorA = buildVector(1);
    const vectorB = buildVector(1.5);
    const queryVector = buildVector(1.1);

    await pool.query(
      `
        INSERT INTO documents (id, title, content, category, tags, content_hash)
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        documentId,
        "Smoke test document",
        "Vector insert and query verification.",
        "technical",
        ["pgvector", "smoke-test"],
        "smoke-test-hash",
      ],
    );

    await pool.query(
      `
        INSERT INTO document_chunks (
          id,
          document_id,
          chunk_index,
          chunk_text,
          char_count,
          content_hash,
          document_title,
          category,
          tags,
          embedding_model,
          embedding_dimensions,
          embedding
        )
        VALUES ($1, $2, 0, $3, $4, $5, $6, $7, $8, $9, $10, $11::vector)
      `,
      [
        chunkId,
        documentId,
        "Vector insert and query verification.",
        39,
        "smoke-chunk-hash",
        "Smoke test document",
        "technical",
        ["pgvector", "smoke-test"],
        "deterministic-mock-v1",
        EMBEDDING_DIMENSIONS,
        toPgVectorLiteral(vectorA),
      ],
    );

    await pool.query(
      `
        INSERT INTO document_chunks (
          id,
          document_id,
          chunk_index,
          chunk_text,
          char_count,
          content_hash,
          document_title,
          category,
          tags,
          embedding_model,
          embedding_dimensions,
          embedding
        )
        VALUES ($1, $2, 1, $3, $4, $5, $6, $7, $8, $9, $10, $11::vector)
      `,
      [
        randomUUID(),
        documentId,
        "Second chunk for ordering verification.",
        37,
        "smoke-chunk-hash-2",
        "Smoke test document",
        "technical",
        ["pgvector"],
        "deterministic-mock-v1",
        EMBEDDING_DIMENSIONS,
        toPgVectorLiteral(vectorB),
      ],
    );

    const result = await pool.query<{
      id: string;
      cosine_distance: string;
    }>(
      `
        SELECT
          id,
          embedding <=> $1::vector AS cosine_distance
        FROM document_chunks
        WHERE embedding_model = $2
          AND embedding_dimensions = $3
        ORDER BY embedding <=> $1::vector
        LIMIT 2
      `,
      [
        toPgVectorLiteral(queryVector),
        "deterministic-mock-v1",
        EMBEDDING_DIMENSIONS,
      ],
    );

    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]?.id).toBeDefined();

    const firstDistance = Number(result.rows[0]?.cosine_distance);
    const secondDistance = Number(result.rows[1]?.cosine_distance);

    expect(Number.isFinite(firstDistance)).toBe(true);
    expect(firstDistance).toBeLessThanOrEqual(secondDistance);

    await pool.query("DELETE FROM documents WHERE id = $1", [documentId]);
  });
});
