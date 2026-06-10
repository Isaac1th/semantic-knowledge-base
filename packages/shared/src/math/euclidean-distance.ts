import { validateDimensions } from "./validate-dimensions.js";

/**
 * Euclidean (L2) distance: sqrt(sum((a_i - b_i)^2)).
 * 0 = identical position in vector space; larger = farther apart.
 */
export function euclideanDistance(a: number[], b: number[]): number {
  validateDimensions(a, b);

  let sumSquares = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i]! - b[i]!;
    sumSquares += diff * diff;
  }

  return Math.sqrt(sumSquares);
}
