import type { Pool } from "pg";

import type { KeywordSearchInput, SearchDebugInfo } from "@skb/shared";

interface KeywordRow {
  chunk_text: string;
  document_title: string;
  document_id: string;
  chunk_index: number;
  category: string | null;
  tags: string[];
  keyword_score: string;
}

export class KeywordSearchService {
  constructor(private readonly pool: Pool) {}

  async search(input: KeywordSearchInput): Promise<SearchDebugInfo> {
    const conditions = ["search_vector @@ plainto_tsquery('english', $1)"];
    const params: unknown[] = [input.query];
    let paramIndex = 2;

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

    const result = await this.pool.query<KeywordRow>(
      `
        SELECT
          chunk_text,
          document_title,
          document_id,
          chunk_index,
          category,
          tags,
          ts_rank(search_vector, plainto_tsquery('english', $1))::text AS keyword_score
        FROM document_chunks
        WHERE ${conditions.join(" AND ")}
        ORDER BY keyword_score DESC
        LIMIT $${paramIndex}
      `,
      params,
    );

    return {
      query: input.query,
      results: result.rows.map((row) => ({
        chunkText: row.chunk_text,
        documentTitle: row.document_title,
        documentId: row.document_id,
        chunkIndex: row.chunk_index,
        category: row.category,
        tags: row.tags,
        similarityScore: 0,
        keywordScore: Number(row.keyword_score),
      })),
    };
  }
}
