export function validateDimensions(a: number[], b: number[], label = "vectors"): void {
  if (a.length === 0 || b.length === 0) {
    throw new Error(`${label} must not be empty`);
  }

  if (a.length !== b.length) {
    throw new Error(
      `${label} dimension mismatch: ${a.length} vs ${b.length}`,
    );
  }
}
