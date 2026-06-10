import { describe, expect, it } from "vitest";

import { DeterministicMockEmbeddingProvider } from "./mock-provider.js";

describe("DeterministicMockEmbeddingProvider", () => {
  const provider = new DeterministicMockEmbeddingProvider(1536);

  it("returns the same vector for the same input", async () => {
    const first = await provider.embedText("hello world");
    const second = await provider.embedText("hello world");
    expect(first).toEqual(second);
  });

  it("returns different vectors for different inputs", async () => {
    const a = await provider.embedText("hello");
    const b = await provider.embedText("world");
    expect(a).not.toEqual(b);
  });

  it("produces vectors with the configured dimensions", async () => {
    const vector = await provider.embedText("dimension check");
    expect(vector).toHaveLength(1536);
  });

  it("embedTexts returns one vector per input in order", async () => {
    const texts = ["alpha", "beta", "gamma"];
    const batch = await provider.embedTexts(texts);
    expect(batch).toHaveLength(3);

    for (let i = 0; i < texts.length; i++) {
      const single = await provider.embedText(texts[i]!);
      expect(batch[i]).toEqual(single);
    }
  });

  it("exposes a stable mock model name", () => {
    expect(provider.modelName).toBe("deterministic-mock-v1");
    expect(provider.dimensions).toBe(1536);
  });
});
