import type { VectorSearchService } from "../vector-search/service.js";
import { loadEvaluationDataset } from "./dataset.js";
import {
  meanReciprocalRank,
  precisionAtK,
  recallAtK,
} from "./metrics.js";

export class EvaluationService {
  constructor(private readonly vectorSearch: VectorSearchService) {}

  async run(topK = 5) {
    const dataset = await loadEvaluationDataset();

    const queryResults = [];

    for (const item of dataset.queries) {
      const search = await this.vectorSearch.search({
        query: item.query,
        topK,
      });

      const retrievedDocumentIds = search.results.map(
        (result) => result.documentId,
      );
      const relevantIds = new Set(item.relevantDocumentIds);

      queryResults.push({
        id: item.id,
        query: item.query,
        relevantDocumentIds: item.relevantDocumentIds,
        irrelevantDocumentIds: item.irrelevantDocumentIds,
        retrievedDocumentIds,
        metrics: {
          precisionAtK: precisionAtK(retrievedDocumentIds, relevantIds, topK),
          recallAtK: recallAtK(retrievedDocumentIds, relevantIds, topK),
          meanReciprocalRank: meanReciprocalRank(
            retrievedDocumentIds,
            relevantIds,
          ),
        },
      });
    }

    const averages = {
      precisionAtK:
        queryResults.reduce((sum, item) => sum + item.metrics.precisionAtK, 0) /
        queryResults.length,
      recallAtK:
        queryResults.reduce((sum, item) => sum + item.metrics.recallAtK, 0) /
        queryResults.length,
      meanReciprocalRank:
        queryResults.reduce(
          (sum, item) => sum + item.metrics.meanReciprocalRank,
          0,
        ) / queryResults.length,
    };

    return {
      description: dataset.description,
      topK,
      metricDefinitions: {
        precisionAtK:
          "Fraction of top-K retrieved documents that are relevant.",
        recallAtK:
          "Fraction of all relevant documents retrieved within top-K.",
        meanReciprocalRank:
          "Average of 1/rank for the first relevant hit per query.",
      },
      averages,
      queries: queryResults,
    };
  }
}
