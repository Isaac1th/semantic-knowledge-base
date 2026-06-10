import { describe, expect, it } from "vitest";

import {
  meanReciprocalRank,
  precisionAtK,
  recallAtK,
} from "./metrics.js";

describe("retrieval metrics", () => {
  const relevant = new Set(["doc-a", "doc-b"]);

  it("computes precision@2", () => {
    expect(precisionAtK(["doc-a", "doc-x", "doc-b"], relevant, 2)).toBe(0.5);
  });

  it("computes recall@3", () => {
    expect(recallAtK(["doc-a", "doc-x", "doc-b"], relevant, 3)).toBe(1);
  });

  it("computes MRR for the first relevant hit at rank 2", () => {
    expect(meanReciprocalRank(["doc-x", "doc-b"], relevant)).toBe(0.5);
  });

  it("returns 0 MRR when no relevant document is retrieved", () => {
    expect(meanReciprocalRank(["doc-x"], relevant)).toBe(0);
  });
});
