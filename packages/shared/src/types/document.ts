export interface DocumentRecord {
  id: string;
  title: string;
  content: string;
  category: string | null;
  tags: string[];
  contentHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentSummary extends DocumentRecord {
  chunkCount: number;
}

export interface ChunkRecord {
  chunkIndex: number;
  chunkText: string;
  charCount: number;
  contentHash: string;
}
