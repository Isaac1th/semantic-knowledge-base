import { computeContentHash } from "./content-hash.js";
import type { ChunkingOptions, TextChunk } from "./types.js";
import { DEFAULT_CHUNKING_OPTIONS } from "./types.js";

function toChunk(index: number, text: string): TextChunk {
  return {
    chunkIndex: index,
    chunkText: text,
    charCount: text.length,
    contentHash: computeContentHash(text),
  };
}

function splitFixedChars(
  text: string,
  chunkSize: number,
  overlap: number,
  minChunkSize: number,
): TextChunk[] {
  if (text.length <= chunkSize) {
    return text.length >= minChunkSize ? [toChunk(0, text)] : [];
  }

  const chunks: TextChunk[] = [];
  let start = 0;
  let index = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const slice = text.slice(start, end);

    if (slice.length >= minChunkSize || end === text.length) {
      chunks.push(toChunk(index, slice));
      index += 1;
    }

    if (end === text.length) {
      break;
    }

    start = Math.max(0, end - overlap);
  }

  return chunks;
}

function splitFixedWords(
  text: string,
  chunkSize: number,
  overlap: number,
  minChunkSize: number,
): TextChunk[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return [];
  }

  const chunks: TextChunk[] = [];
  let start = 0;
  let index = 0;

  while (start < words.length) {
    const sliceWords = words.slice(start, start + chunkSize);
    const slice = sliceWords.join(" ");

    if (slice.length >= minChunkSize || start + chunkSize >= words.length) {
      chunks.push(toChunk(index, slice));
      index += 1;
    }

    if (start + chunkSize >= words.length) {
      break;
    }

    start = Math.max(0, start + chunkSize - overlap);
  }

  return chunks;
}

function splitParagraphs(
  text: string,
  minChunkSize: number,
): TextChunk[] {
  const paragraphs = text
    .split(/\n\s*\n+/)
    .map((part) => part.trim())
    .filter(Boolean);

  return paragraphs
    .filter((part) => part.length >= minChunkSize)
    .map((part, index) => toChunk(index, part));
}

export function splitIntoChunks(
  text: string,
  options: Partial<ChunkingOptions> = {},
): TextChunk[] {
  const config = { ...DEFAULT_CHUNKING_OPTIONS, ...options };

  switch (config.strategy) {
    case "fixed_words":
      return splitFixedWords(
        text,
        config.chunkSize,
        config.overlap,
        config.minChunkSize,
      );
    case "paragraphs":
      return splitParagraphs(text, config.minChunkSize);
    case "fixed_chars":
    default:
      return splitFixedChars(
        text,
        config.chunkSize,
        config.overlap,
        config.minChunkSize,
      );
  }
}
