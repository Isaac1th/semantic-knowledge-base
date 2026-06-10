const EPSILON = 1e-9;

export function normalizeScores(scores: number[]): number[] {
  if (scores.length === 0) {
    return [];
  }

  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const range = max - min;

  if (range < EPSILON) {
    return scores.map(() => 1);
  }

  return scores.map((score) => (score - min) / (range + EPSILON));
}

export function combineScores(
  normalizedVectorScore: number,
  normalizedKeywordScore: number,
  vectorWeight: number,
  keywordWeight: number,
): number {
  return vectorWeight * normalizedVectorScore + keywordWeight * normalizedKeywordScore;
}
