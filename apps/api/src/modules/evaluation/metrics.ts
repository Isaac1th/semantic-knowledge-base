/**
 * Precision@K: fraction of top-K retrieved items that are relevant.
 */
export function precisionAtK(
  retrievedIds: string[],
  relevantIds: Set<string>,
  k: number,
): number {
  if (k <= 0) {
    return 0;
  }

  const topK = retrievedIds.slice(0, k);
  const relevantHits = topK.filter((id) => relevantIds.has(id)).length;

  return relevantHits / k;
}

/**
 * Recall@K: fraction of all relevant items found in the top-K results.
 */
export function recallAtK(
  retrievedIds: string[],
  relevantIds: Set<string>,
  k: number,
): number {
  if (relevantIds.size === 0 || k <= 0) {
    return 0;
  }

  const topK = retrievedIds.slice(0, k);
  const relevantHits = topK.filter((id) => relevantIds.has(id)).length;

  return relevantHits / relevantIds.size;
}

/**
 * Mean Reciprocal Rank: 1 / rank of the first relevant result (0 if none).
 */
export function meanReciprocalRank(
  retrievedIds: string[],
  relevantIds: Set<string>,
): number {
  for (let index = 0; index < retrievedIds.length; index++) {
    if (relevantIds.has(retrievedIds[index]!)) {
      return 1 / (index + 1);
    }
  }

  return 0;
}
