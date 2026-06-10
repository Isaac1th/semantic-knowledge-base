import { createHash } from "node:crypto";

import type { EmbeddingProvider } from "./types.js";
import { validateVectorDimensions } from "./validate-vector.js";

const MOCK_MODEL_NAME = "deterministic-mock-v1";

/**
 * Generates a reproducible vector from text using SHA-256 as a seed.
 * Identical input always produces identical output; not semantically meaningful.
 */
function textToVector(text: string, dimensions: number): number[] {
  const hash = createHash("sha256").update(text).digest();
  const vector: number[] = [];

  for (let i = 0; i < dimensions; i++) {
    const byte = hash[i % hash.length]!;
    // Map byte [0,255] to float in [-1, 1]
    vector.push((byte / 127.5) - 1);
  }

  return vector;
}

export class DeterministicMockEmbeddingProvider implements EmbeddingProvider {
  readonly modelName = MOCK_MODEL_NAME;
  readonly dimensions: number;

  constructor(dimensions: number) {
    this.dimensions = dimensions;
  }

  async embedText(text: string): Promise<number[]> {
    const vector = textToVector(text, this.dimensions);
    validateVectorDimensions(vector, this.dimensions, "mock embedText");
    return vector;
  }

  async embedTexts(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((text) => this.embedText(text)));
  }
}
