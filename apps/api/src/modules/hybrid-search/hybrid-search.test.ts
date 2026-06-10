import { describe, expect, it } from "vitest";

import { combineScores, normalizeScores } from "./normalize-scores.js";

describe("normalizeScores", () => {
  it("maps scores to the 0-1 range", () => {
    const normalized = normalizeScores([0, 5, 10]);
    expect(normalized[0]).toBe(0);
    expect(normalized[1]).toBeCloseTo(0.5, 5);
    expect(normalized[2]).toBeCloseTo(1, 5);
  });

  it("returns 1 for identical scores", () => {
    expect(normalizeScores([3, 3, 3])).toEqual([1, 1, 1]);
  });
});

describe("combineScores", () => {
  it("applies configurable weights", () => {
    const score = combineScores(1, 0, 0.7, 0.3);
    expect(score).toBeCloseTo(0.7, 5);
  });

  it("combines both signals", () => {
    const score = combineScores(0.8, 0.4, 0.7, 0.3);
    expect(score).toBeCloseTo(0.68, 5);
  });
});
