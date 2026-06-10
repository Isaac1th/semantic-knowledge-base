import type { Pool } from "pg";

import type { SearchDebugInfo, VectorSearchInput } from "@skb/shared";

import { toPgVectorLiteral } from "../../db/vector-utils.js";
import type { EmbeddingProvider } from "../embeddings/types.js";

interface VectorRow {
  chunk_text: string;
  document_title: string;
  document_id: string;
  chunk_index: number;
  category: string | null;
  tags: string[];
  cosine_distance: string;
}

const EMBEDDING_PREVIEW_LENGTH = 10;

export class VectorSearchService {
  constructor(
    private readonly pool: Pool,
    private readonly embeddingProvider: EmbeddingProvider,
  ) {}

  async search(input: VectorSearchInput): Promise<SearchDebugInfo> {
    const modelName = input.embeddingModel ?? this.embeddingProvider.modelName;
    const dimensions = this.embeddingProvider.dimensions;

    const queryVector = await this.embeddingProvider.embedText(input.query);

    const conditions = [
      "embedding_model = $2",
      "embedding_dimensions = $3",
    ];
    const params: unknown[] = [
      toPgVectorLiteral(queryVector),
      modelName,
      dimensions,
    ];
    let paramIndex = 4;

    if (input.category) {
      conditions.push(`category = $${paramIndex}`);
      params.push(input.category);
      paramIndex += 1;
    }

    if (input.tags && input.tags.length > 0) {
      conditions.push(`tags @> $${paramIndex}::text[]`);
      params.push(input.tags);
      paramIndex += 1;
    }

    params.push(input.topK);

    const result = await this.pool.query<VectorRow>(
      `
        SELECT
          chunk_text,
          document_title,
          document_id,
          chunk_index,
          category,
          tags,
          (embedding <=> $1::vector)::text AS cosine_distance
        FROM document_chunks
        WHERE ${conditions.join(" AND ")}
        ORDER BY embedding <=> $1::vector
        LIMIT $${paramIndex}
      `,
      params,
    );

    const results = result.rows
      .map((row) => {
        const distance = Number(row.cosine_distance);
        const similarityScore = 1 - distance;

        return {
          chunkText: row.chunk_text,
          documentTitle: row.document_title,
          documentId: row.document_id,
          chunkIndex: row.chunk_index,
          category: row.category,
          tags: row.tags,
          similarityScore,
        };
      })
      .filter((row) =>
        input.threshold === undefined
          ? true
          : row.similarityScore >= input.threshold,
      );

    return {
      query: input.query,
      embeddingModel: modelName,
      embeddingDimensions: dimensions,
      queryEmbeddingPreview: queryVector.slice(0, EMBEDDING_PREVIEW_LENGTH),
      results,
    };
  }
}
