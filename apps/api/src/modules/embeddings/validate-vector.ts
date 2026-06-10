export function validateVectorDimensions(
  vector: number[],
  expectedDimensions: number,
  context: string,
): void {
  if (vector.length !== expectedDimensions) {
    throw new Error(
      `${context}: expected ${expectedDimensions} dimensions, got ${vector.length}`,
    );
  }
}
