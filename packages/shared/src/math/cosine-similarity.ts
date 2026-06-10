import { dotProduct } from "./dot-product.js";
import { validateDimensions } from "./validate-dimensions.js";

function magnitude(v: number[]): number {
  let sumSquares = 0;
  for (const component of v) {
    sumSquares += component * component;
  }

  return Math.sqrt(sumSquares);
}

/**
 * Cosine similarity: dot(a,b) / (||a|| * ||b||).
 * Range [-1, 1] for non-zero vectors; 1 = same direction, 0 = orthogonal, -1 = opposite.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  validateDimensions(a, b);

  const magA = magnitude(a);
  const magB = magnitude(b);

  if (magA === 0 || magB === 0) {
    throw new Error("cosine similarity is undefined for zero-magnitude vectors");
  }

  return dotProduct(a, b) / (magA * magB);
}
