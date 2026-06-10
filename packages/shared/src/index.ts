export const EMBEDDING_DIMENSIONS_DEFAULT = 1536;

export const EMBEDDING_MODEL_DEFAULT = "text-embedding-3-small";

export type {
  ChunkRecord,
  DocumentRecord,
  DocumentSummary,
} from "./types/document.js";

export {
  createDocumentSchema,
  updateDocumentSchema,
  type CreateDocumentInput,
  type UpdateDocumentInput,
} from "./schemas/document.js";

export { apiErrorSchema, type ApiErrorBody } from "./schemas/error.js";
