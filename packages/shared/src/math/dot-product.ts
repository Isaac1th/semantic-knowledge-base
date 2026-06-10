import { validateDimensions } from "./validate-dimensions.js";

/**
 * Dot product: sum of element-wise products.
 * Measures how much two vectors point in the same direction (unsigned).
 */
export function dotProduct(a: number[], b: number[]): number {
  validateDimensions(a, b);

  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i]! * b[i]!;
  }

  return sum;
}
