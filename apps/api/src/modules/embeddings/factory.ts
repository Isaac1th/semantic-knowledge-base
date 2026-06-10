import type { Env } from "../../config/env.js";
import { DeterministicMockEmbeddingProvider } from "./mock-provider.js";
import { OpenAIEmbeddingProvider } from "./openai-provider.js";
import type { EmbeddingProvider } from "./types.js";

export function createEmbeddingProvider(env: Env): EmbeddingProvider {
  if (env.EMBEDDING_PROVIDER === "openai") {
    if (!env.OPENAI_API_KEY) {
      throw new Error(
        "OPENAI_API_KEY is required when EMBEDDING_PROVIDER=openai",
      );
    }

    return new OpenAIEmbeddingProvider(
      env.OPENAI_API_KEY,
      env.EMBEDDING_MODEL,
      env.EMBEDDING_DIMENSIONS,
    );
  }

  return new DeterministicMockEmbeddingProvider(env.EMBEDDING_DIMENSIONS);
}
