import { z } from "zod";

const metadataFiltersSchema = z.object({
  category: z.string().trim().optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
});

export const keywordSearchSchema = metadataFiltersSchema.extend({
  query: z.string().trim().min(1, "query is required"),
  topK: z.coerce.number().int().positive().max(100).default(10),
});

export const vectorSearchSchema = metadataFiltersSchema.extend({
  query: z.string().trim().min(1, "query is required"),
  topK: z.coerce.number().int().positive().max(100).default(10),
  threshold: z.coerce.number().min(-1).max(1).optional(),
  embeddingModel: z.string().trim().optional(),
});

export const hybridSearchSchema = vectorSearchSchema.extend({
  vectorWeight: z.coerce.number().min(0).max(1).default(0.7),
  keywordWeight: z.coerce.number().min(0).max(1).default(0.3),
});

export type KeywordSearchInput = z.infer<typeof keywordSearchSchema>;
export type VectorSearchInput = z.infer<typeof vectorSearchSchema>;
export type HybridSearchInput = z.infer<typeof hybridSearchSchema>;

export const compareTextsSchema = z.object({
  textA: z.string().min(1),
  textB: z.string().min(1),
});

export const chunkTextSchema = z.object({
  text: z.string().min(1),
  strategy: z
    .enum(["fixed_chars", "fixed_words", "paragraphs"])
    .default("fixed_chars"),
  chunkSize: z.coerce.number().int().positive().default(500),
  overlap: z.coerce.number().int().nonnegative().default(50),
});
