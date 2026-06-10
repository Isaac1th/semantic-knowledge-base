export interface SearchResultItem {
  chunkText: string;
  documentTitle: string;
  documentId: string;
  chunkIndex: number;
  category: string | null;
  tags: string[];
  similarityScore: number;
  keywordScore?: number;
  combinedScore?: number;
}

export interface SearchDebugInfo {
  query: string;
  embeddingModel?: string;
  embeddingDimensions?: number;
  queryEmbeddingPreview?: number[];
  results: SearchResultItem[];
}
