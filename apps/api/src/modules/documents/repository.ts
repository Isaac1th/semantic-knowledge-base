import type { Pool, PoolClient } from "pg";

import { toPgVectorLiteral } from "../../db/vector-utils.js";
import type { TextChunk } from "../chunking/index.js";
import type { EmbeddingProvider } from "../embeddings/types.js";

interface DocumentRow {
  id: string;
  title: string;
  content: string;
  category: string | null;
  tags: string[];
  content_hash: string;
  created_at: Date;
  updated_at: Date;
}

export interface DocumentDto {
  id: string;
  title: string;
  content: string;
  category: string | null;
  tags: string[];
  contentHash: string;
  createdAt: string;
  updatedAt: string;
  chunkCount: number;
}

function mapDocument(row: DocumentRow, chunkCount = 0): DocumentDto {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    category: row.category,
    tags: row.tags,
    contentHash: row.content_hash,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    chunkCount,
  };
}

export class DocumentRepository {
  constructor(private readonly pool: Pool) {}

  async listDocuments(): Promise<DocumentDto[]> {
    const result = await this.pool.query<DocumentRow & { chunk_count: string }>(
      `
        SELECT
          d.*,
          COUNT(c.id)::text AS chunk_count
        FROM documents d
        LEFT JOIN document_chunks c ON c.document_id = d.id
        GROUP BY d.id
        ORDER BY d.updated_at DESC
      `,
    );

    return result.rows.map((row) =>
      mapDocument(row, Number(row.chunk_count)),
    );
  }

  async getDocumentById(id: string): Promise<DocumentDto | null> {
    const result = await this.pool.query<DocumentRow & { chunk_count: string }>(
      `
        SELECT
          d.*,
          COUNT(c.id)::text AS chunk_count
        FROM documents d
        LEFT JOIN document_chunks c ON c.document_id = d.id
        WHERE d.id = $1
        GROUP BY d.id
      `,
      [id],
    );

    const row = result.rows[0];
    if (!row) {
      return null;
    }

    return mapDocument(row, Number(row.chunk_count));
  }

  async createDocument(
    id: string,
    input: {
      title: string;
      content: string;
      category?: string | undefined;
      tags: string[];
      contentHash: string;
    },
  ): Promise<DocumentDto> {
    const result = await this.pool.query<DocumentRow>(
      `
        INSERT INTO documents (id, title, content, category, tags, content_hash)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `,
      [
        id,
        input.title,
        input.content,
        input.category ?? null,
        input.tags,
        input.contentHash,
      ],
    );

    return mapDocument(result.rows[0]!);
  }

  async updateDocument(
    id: string,
    input: {
      title?: string | undefined;
      content?: string | undefined;
      category?: string | undefined;
      tags?: string[] | undefined;
      contentHash?: string | undefined;
    },
  ): Promise<DocumentDto | null> {
    const existing = await this.getDocumentById(id);
    if (!existing) {
      return null;
    }

    const result = await this.pool.query<DocumentRow>(
      `
        UPDATE documents
        SET
          title = $2,
          content = $3,
          category = $4,
          tags = $5,
          content_hash = $6,
          updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `,
      [
        id,
        input.title ?? existing.title,
        input.content ?? existing.content,
        input.category ?? existing.category,
        input.tags ?? existing.tags,
        input.contentHash ?? existing.contentHash,
      ],
    );

    return mapDocument(result.rows[0]!);
  }

  async deleteDocument(id: string): Promise<boolean> {
    const result = await this.pool.query(
      "DELETE FROM documents WHERE id = $1",
      [id],
    );

    return (result.rowCount ?? 0) > 0;
  }

  async replaceChunks(
    client: PoolClient,
    document: DocumentDto,
    chunks: TextChunk[],
    embeddings: number[][],
    provider: EmbeddingProvider,
  ): Promise<void> {
    await client.query("DELETE FROM document_chunks WHERE document_id = $1", [
      document.id,
    ]);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]!;
      const embedding = embeddings[i]!;

      await client.query(
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
          VALUES (
            gen_random_uuid(),
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9,
            $10,
            $11::vector
          )
        `,
        [
          document.id,
          chunk.chunkIndex,
          chunk.chunkText,
          chunk.charCount,
          chunk.contentHash,
          document.title,
          document.category,
          document.tags,
          provider.modelName,
          provider.dimensions,
          toPgVectorLiteral(embedding),
        ],
      );
    }
  }
}
