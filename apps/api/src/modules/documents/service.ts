import { randomUUID } from "node:crypto";

import type { Pool } from "pg";

import type {
  CreateDocumentInput,
  UpdateDocumentInput,
} from "@skb/shared";

import { getPool } from "../../db/pool.js";
import {
  computeContentHash,
  normalizeText,
  splitIntoChunks,
} from "../chunking/index.js";
import type { EmbeddingProvider } from "../embeddings/types.js";
import { AppError } from "../../middleware/error-handler.js";
import { DocumentRepository, type DocumentDto } from "./repository.js";

export interface IndexResult {
  document: DocumentDto;
  indexed: boolean;
  chunkCount: number;
}

export class DocumentService {
  private readonly repository: DocumentRepository;

  constructor(
    private readonly pool: Pool,
    private readonly embeddingProvider: EmbeddingProvider,
  ) {
    this.repository = new DocumentRepository(pool);
  }

  async listDocuments(): Promise<DocumentDto[]> {
    return this.repository.listDocuments();
  }

  async getDocument(id: string): Promise<DocumentDto> {
    const document = await this.repository.getDocumentById(id);
    if (!document) {
      throw new AppError(404, "NOT_FOUND", `Document ${id} not found`);
    }

    return document;
  }

  async createDocument(input: CreateDocumentInput): Promise<IndexResult> {
    const id = randomUUID();
    const contentHash = computeContentHash(input.content);

    const document = await this.repository.createDocument(id, {
      title: input.title,
      content: input.content,
      category: input.category,
      tags: input.tags,
      contentHash,
    });

    const chunkCount = await this.indexDocument(document);
    const refreshed = await this.getDocument(document.id);

    return { document: refreshed, indexed: true, chunkCount };
  }

  async updateDocument(
    id: string,
    input: UpdateDocumentInput,
  ): Promise<IndexResult> {
    const existing = await this.getDocument(id);
    const nextContent = input.content ?? existing.content;
    const nextHash = computeContentHash(nextContent);

    const updated = await this.repository.updateDocument(id, {
      title: input.title,
      content: input.content,
      category: input.category,
      tags: input.tags,
      contentHash: nextHash,
    });

    if (!updated) {
      throw new AppError(404, "NOT_FOUND", `Document ${id} not found`);
    }

    if (nextHash === existing.contentHash) {
      const current = await this.getDocument(id);
      return {
        document: current,
        indexed: false,
        chunkCount: current.chunkCount,
      };
    }

    const chunkCount = await this.indexDocument(updated);
    const refreshed = await this.getDocument(id);

    return { document: refreshed, indexed: true, chunkCount };
  }

  async deleteDocument(id: string): Promise<void> {
    const deleted = await this.repository.deleteDocument(id);
    if (!deleted) {
      throw new AppError(404, "NOT_FOUND", `Document ${id} not found`);
    }
  }

  async reindexDocument(id: string): Promise<IndexResult> {
    const document = await this.getDocument(id);
    const chunkCount = await this.indexDocument(document);
    const refreshed = await this.getDocument(id);

    return { document: refreshed, indexed: true, chunkCount };
  }

  private async indexDocument(document: DocumentDto): Promise<number> {
    const normalized = normalizeText(document.content);
    const chunks = splitIntoChunks(normalized);

    if (chunks.length === 0) {
      throw new AppError(
        400,
        "INDEXING_ERROR",
        "Document content is too short to produce chunks",
      );
    }

    const embeddings = await this.embeddingProvider.embedTexts(
      chunks.map((chunk) => chunk.chunkText),
    );

    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");
      await this.repository.replaceChunks(
        client,
        document,
        chunks,
        embeddings,
        this.embeddingProvider,
      );
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }

    return chunks.length;
  }
}

export function createDocumentService(
  embeddingProvider: EmbeddingProvider,
): DocumentService {
  return new DocumentService(getPool(), embeddingProvider);
}
