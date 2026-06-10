import { describe, expect, it } from "vitest";

import { cosineSimilarity, dotProduct, euclideanDistance } from "./index.js";

describe("dotProduct", () => {
  // Worked example: [1,2,3] · [4,5,6] = 1*4 + 2*5 + 3*6 = 32
  it("computes the sum of element-wise products", () => {
    expect(dotProduct([1, 2, 3], [4, 5, 6])).toBe(32);
  });

  it("returns 0 for orthogonal unit vectors", () => {
    expect(dotProduct([1, 0], [0, 1])).toBe(0);
  });

  it("throws on dimension mismatch", () => {
    expect(() => dotProduct([1, 2], [1, 2, 3])).toThrow(/dimension mismatch/);
  });
});

describe("cosineSimilarity", () => {
  // Worked example: identical direction → cosine = 1
  it("returns 1 for identical direction vectors", () => {
    expect(cosineSimilarity([1, 0], [2, 0])).toBe(1);
  });

  // Worked example: orthogonal → cosine = 0
  it("returns 0 for orthogonal vectors", () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBe(0);
  });

  // Worked example: opposite direction → cosine = -1
  it("returns -1 for opposite direction vectors", () => {
    expect(cosineSimilarity([1, 0], [-1, 0])).toBe(-1);
  });

  // Worked example: [1,1] vs [1,0]
  // dot = 1, ||a|| = sqrt(2), ||b|| = 1 → cos = 1/sqrt(2) ≈ 0.7071
  it("computes cosine for non-axis-aligned vectors", () => {
    const result = cosineSimilarity([1, 1], [1, 0]);
    expect(result).toBeCloseTo(1 / Math.SQRT2, 5);
  });

  it("throws on dimension mismatch", () => {
    expect(() => cosineSimilarity([1], [1, 2])).toThrow(/dimension mismatch/);
  });

  it("throws for zero-magnitude vectors", () => {
    expect(() => cosineSimilarity([0, 0], [1, 0])).toThrow(/zero-magnitude/);
  });
});

describe("euclideanDistance", () => {
  // Worked example: 3-4-5 triangle — distance between (0,0) and (3,4) = 5
  it("computes distance using the Pythagorean theorem", () => {
    expect(euclideanDistance([0, 0], [3, 4])).toBe(5);
  });

  // Worked example: identical points → distance 0
  it("returns 0 for identical vectors", () => {
    expect(euclideanDistance([1, 2, 3], [1, 2, 3])).toBe(0);
  });

  // Worked example: [1,2] to [4,6] → sqrt(9+16) = 5
  it("computes distance for arbitrary coordinates", () => {
    expect(euclideanDistance([1, 2], [4, 6])).toBe(5);
  });

  it("throws on dimension mismatch", () => {
    expect(() => euclideanDistance([1], [1, 2])).toThrow(/dimension mismatch/);
  });
});
