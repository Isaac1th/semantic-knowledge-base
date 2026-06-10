import type { HybridSearchInput, SearchDebugInfo } from "@skb/shared";

import type { KeywordSearchService } from "../keyword-search/service.js";
import type { VectorSearchService } from "../vector-search/service.js";
import { combineScores, normalizeScores } from "./normalize-scores.js";

export class HybridSearchService {
  constructor(
    private readonly keywordSearch: KeywordSearchService,
    private readonly vectorSearch: VectorSearchService,
  ) {}

  async search(input: HybridSearchInput): Promise<SearchDebugInfo> {
    const [keywordResult, vectorResult] = await Promise.all([
      this.keywordSearch.search({
        query: input.query,
        topK: input.topK,
        category: input.category,
        tags: input.tags,
      }),
      this.vectorSearch.search({
        query: input.query,
        topK: input.topK,
        threshold: input.threshold,
        category: input.category,
        tags: input.tags,
        embeddingModel: input.embeddingModel,
      }),
    ]);

    const merged = new Map<
      string,
      {
        chunkText: string;
        documentTitle: string;
        documentId: string;
        chunkIndex: number;
        category: string | null;
        tags: string[];
        similarityScore: number;
        keywordScore: number;
      }
    >();

    for (const item of vectorResult.results) {
      const key = `${item.documentId}:${item.chunkIndex}`;
      merged.set(key, {
        chunkText: item.chunkText,
        documentTitle: item.documentTitle,
        documentId: item.documentId,
        chunkIndex: item.chunkIndex,
        category: item.category,
        tags: item.tags,
        similarityScore: item.similarityScore,
        keywordScore: 0,
      });
    }

    for (const item of keywordResult.results) {
      const key = `${item.documentId}:${item.chunkIndex}`;
      const existing = merged.get(key);

      if (existing) {
        existing.keywordScore = item.keywordScore ?? 0;
      } else {
        merged.set(key, {
          chunkText: item.chunkText,
          documentTitle: item.documentTitle,
          documentId: item.documentId,
          chunkIndex: item.chunkIndex,
          category: item.category,
          tags: item.tags,
          similarityScore: 0,
          keywordScore: item.keywordScore ?? 0,
        });
      }
    }

    const candidates = [...merged.values()];
    const normalizedVector = normalizeScores(
      candidates.map((item) => item.similarityScore),
    );
    const normalizedKeyword = normalizeScores(
      candidates.map((item) => item.keywordScore),
    );

    const results = candidates
      .map((item, index) => ({
        chunkText: item.chunkText,
        documentTitle: item.documentTitle,
        documentId: item.documentId,
        chunkIndex: item.chunkIndex,
        category: item.category,
        tags: item.tags,
        similarityScore: item.similarityScore,
        keywordScore: item.keywordScore,
        combinedScore: combineScores(
          normalizedVector[index]!,
          normalizedKeyword[index]!,
          input.vectorWeight,
          input.keywordWeight,
        ),
      }))
      .sort((a, b) => (b.combinedScore ?? 0) - (a.combinedScore ?? 0))
      .slice(0, input.topK);

    return {
      query: input.query,
      ...(vectorResult.embeddingModel
        ? { embeddingModel: vectorResult.embeddingModel }
        : {}),
      ...(vectorResult.embeddingDimensions !== undefined
        ? { embeddingDimensions: vectorResult.embeddingDimensions }
        : {}),
      ...(vectorResult.queryEmbeddingPreview
        ? { queryEmbeddingPreview: vectorResult.queryEmbeddingPreview }
        : {}),
      results,
    };
  }
}
