import type { Pool } from "pg";

import {
  cosineSimilarity,
  dotProduct,
  euclideanDistance,
} from "@skb/shared";

import { toPgVectorLiteral } from "../../db/vector-utils.js";
import type { EmbeddingProvider } from "../embeddings/types.js";
import { splitIntoChunks } from "../chunking/index.js";
import type { ChunkStrategy } from "../chunking/types.js";

export class ExperimentsService {
  constructor(
    private readonly pool: Pool,
    private readonly embeddingProvider: EmbeddingProvider,
  ) {}

  async compareTexts(textA: string, textB: string) {
    const [vectorA, vectorB] = await Promise.all([
      this.embeddingProvider.embedText(textA),
      this.embeddingProvider.embedText(textB),
    ]);

    const dbDistances = await this.pool.query<{
      cosine_distance: string;
      negative_inner_product: string;
      euclidean_distance: string;
    }>(
      `
        SELECT
          $1::vector <=> $2::vector AS cosine_distance,
          $1::vector <#> $2::vector AS negative_inner_product,
          $1::vector <-> $2::vector AS euclidean_distance
      `,
      [toPgVectorLiteral(vectorA), toPgVectorLiteral(vectorB)],
    );

    const dbRow = dbDistances.rows[0]!;

    return {
      textA,
      textB,
      typescript: {
        cosineSimilarity: cosineSimilarity(vectorA, vectorB),
        dotProduct: dotProduct(vectorA, vectorB),
        euclideanDistance: euclideanDistance(vectorA, vectorB),
      },
      database: {
        cosineDistance: Number(dbRow.cosine_distance),
        negativeInnerProduct: Number(dbRow.negative_inner_product),
        euclideanDistance: Number(dbRow.euclidean_distance),
      },
      explanations: {
        cosineSimilarity:
          "Measures directional alignment from -1 (opposite) to 1 (identical direction).",
        dotProduct:
          "Raw projection of one vector onto another; magnitude-sensitive.",
        euclideanDistance:
          "Straight-line distance between vector endpoints in embedding space.",
      },
    };
  }

  previewChunks(input: {
    text: string;
    strategy: ChunkStrategy;
    chunkSize: number;
    overlap: number;
  }) {
    const chunks = splitIntoChunks(input.text, {
      strategy: input.strategy,
      chunkSize: input.chunkSize,
      overlap: input.overlap,
    });

    return {
      strategy: input.strategy,
      chunkSize: input.chunkSize,
      overlap: input.overlap,
      chunkCount: chunks.length,
      chunks,
    };
  }
}
