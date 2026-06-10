import { afterEach, describe, expect, it, vi } from "vitest";

import { OpenAIEmbeddingProvider } from "./openai-provider.js";

describe("OpenAIEmbeddingProvider", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("validates embedding dimensions from the API response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: [{ index: 0, embedding: [0.1, 0.2] }],
        }),
      }),
    );

    const provider = new OpenAIEmbeddingProvider(
      "test-key",
      "text-embedding-3-small",
      1536,
    );

    await expect(provider.embedText("hello")).rejects.toThrow(
      /expected 1536 dimensions/,
    );
  });

  it("batches requests in groups of 100", async () => {
    const fetchMock = vi.fn().mockImplementation(async (_url, init) => {
      const body = JSON.parse((init as RequestInit).body as string) as {
        input: string[];
      };

      return {
        ok: true,
        json: async () => ({
          data: body.input.map((_, index) => ({
            index,
            embedding: Array.from({ length: 4 }, () => 0.5),
          })),
        }),
      };
    });

    vi.stubGlobal("fetch", fetchMock);

    const provider = new OpenAIEmbeddingProvider("test-key", "test-model", 4);
    const texts = Array.from({ length: 150 }, (_, i) => `text-${i}`);
    const results = await provider.embedTexts(texts);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(results).toHaveLength(150);
  });

  it("throws when the API returns an error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: async () => "unauthorized",
      }),
    );

    const provider = new OpenAIEmbeddingProvider("bad-key", "test-model", 4);

    await expect(provider.embedText("hello")).rejects.toThrow(
      /OpenAI embeddings request failed/,
    );
  });
});
