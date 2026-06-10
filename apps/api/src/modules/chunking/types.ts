export type ChunkStrategy = "fixed_chars" | "fixed_words" | "paragraphs";

export interface ChunkingOptions {
  strategy: ChunkStrategy;
  chunkSize: number;
  overlap: number;
  minChunkSize: number;
}

export interface TextChunk {
  chunkIndex: number;
  chunkText: string;
  charCount: number;
  contentHash: string;
}

export const DEFAULT_CHUNKING_OPTIONS: ChunkingOptions = {
  strategy: "fixed_chars",
  chunkSize: 500,
  overlap: 50,
  minChunkSize: 100,
};
