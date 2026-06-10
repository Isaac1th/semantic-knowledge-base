import { describe, expect, it } from "vitest";

import { computeContentHash } from "./content-hash.js";
import { normalizeText } from "./normalize.js";
import { splitIntoChunks } from "./split.js";

describe("normalizeText", () => {
  it("collapses whitespace and trims", () => {
    expect(normalizeText("  hello   world \n")).toBe("hello world");
  });
});

describe("computeContentHash", () => {
  it("returns the same hash for equivalent normalized text", () => {
    const a = computeContentHash("Hello   World");
    const b = computeContentHash("  Hello World ");
    expect(a).toBe(b);
  });
});

describe("splitIntoChunks", () => {
  const longText = "word ".repeat(200).trim();

  it("creates overlapping fixed-character chunks", () => {
    const chunks = splitIntoChunks(longText, {
      strategy: "fixed_chars",
      chunkSize: 100,
      overlap: 20,
      minChunkSize: 50,
    });

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0]?.chunkIndex).toBe(0);
    expect(chunks[1]?.chunkIndex).toBe(1);
  });

  it("splits by paragraphs", () => {
    const text = "First paragraph with enough characters to pass the minimum size requirement.\n\nSecond paragraph also long enough to become its own chunk in the pipeline.";
    const chunks = splitIntoChunks(text, {
      strategy: "paragraphs",
      minChunkSize: 40,
    });

    expect(chunks).toHaveLength(2);
  });
});
