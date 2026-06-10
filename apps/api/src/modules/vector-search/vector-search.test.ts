import { describe, expect, it } from "vitest";

function cosineToSimilarity(distance: number): number {
  return 1 - distance;
}

describe("vector search scoring", () => {
  it("converts cosine distance to similarity", () => {
    expect(cosineToSimilarity(0)).toBe(1);
    expect(cosineToSimilarity(1)).toBe(0);
  });

  it("filters results below a similarity threshold", () => {
    const rows = [
      { similarityScore: 0.9 },
      { similarityScore: 0.4 },
      { similarityScore: 0.2 },
    ];

    const threshold = 0.5;
    const filtered = rows.filter((row) => row.similarityScore >= threshold);

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.similarityScore).toBe(0.9);
  });
});
