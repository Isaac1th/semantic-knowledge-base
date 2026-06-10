import type { EmbeddingProvider } from "./types.js";
import { validateVectorDimensions } from "./validate-vector.js";

const OPENAI_EMBEDDINGS_URL = "https://api.openai.com/v1/embeddings";
const MAX_BATCH_SIZE = 100;

interface OpenAIEmbeddingsResponse {
  data: Array<{ embedding: number[]; index: number }>;
}

export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  readonly modelName: string;
  readonly dimensions: number;

  constructor(
    private readonly apiKey: string,
    modelName: string,
    dimensions: number,
  ) {
    this.modelName = modelName;
    this.dimensions = dimensions;
  }

  async embedText(text: string): Promise<number[]> {
    const [vector] = await this.embedTexts([text]);
    return vector!;
  }

  async embedTexts(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) {
      return [];
    }

    const results: number[][] = [];

    for (let offset = 0; offset < texts.length; offset += MAX_BATCH_SIZE) {
      const batch = texts.slice(offset, offset + MAX_BATCH_SIZE);
      const batchResults = await this.embedBatch(batch);

      for (const vector of batchResults) {
        validateVectorDimensions(
          vector,
          this.dimensions,
          `OpenAI ${this.modelName}`,
        );
        results.push(vector);
      }
    }

    return results;
  }

  private async embedBatch(texts: string[]): Promise<number[][]> {
    const response = await fetch(OPENAI_EMBEDDINGS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.modelName,
        input: texts,
        dimensions: this.dimensions,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `OpenAI embeddings request failed (${response.status}): ${body}`,
      );
    }

    const payload = (await response.json()) as OpenAIEmbeddingsResponse;
    const ordered = payload.data
      .sort((a, b) => a.index - b.index)
      .map((item) => item.embedding);

    if (ordered.length !== texts.length) {
      throw new Error(
        `OpenAI returned ${ordered.length} embeddings for ${texts.length} inputs`,
      );
    }

    return ordered;
  }
}
