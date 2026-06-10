import { describe, expect, it } from "vitest";

import type { Env } from "../../config/env.js";
import { createEmbeddingProvider } from "./factory.js";
import { DeterministicMockEmbeddingProvider } from "./mock-provider.js";
import { OpenAIEmbeddingProvider } from "./openai-provider.js";

const baseEnv: Env = {
  DATABASE_URL: "postgresql://skb:skb@localhost:5432/semantic_kb",
  PORT: 3001,
  NODE_ENV: "test",
  EMBEDDING_PROVIDER: "mock",
  EMBEDDING_MODEL: "text-embedding-3-small",
  EMBEDDING_DIMENSIONS: 1536,
};

describe("createEmbeddingProvider", () => {
  it("returns a mock provider by default", () => {
    const provider = createEmbeddingProvider(baseEnv);
    expect(provider).toBeInstanceOf(DeterministicMockEmbeddingProvider);
  });

  it("returns an OpenAI provider when configured", () => {
    const provider = createEmbeddingProvider({
      ...baseEnv,
      EMBEDDING_PROVIDER: "openai",
      OPENAI_API_KEY: "sk-test",
    });

    expect(provider).toBeInstanceOf(OpenAIEmbeddingProvider);
  });

  it("requires an API key for the OpenAI provider", () => {
    expect(() =>
      createEmbeddingProvider({
        ...baseEnv,
        EMBEDDING_PROVIDER: "openai",
      }),
    ).toThrow(/OPENAI_API_KEY is required/);
  });
});
