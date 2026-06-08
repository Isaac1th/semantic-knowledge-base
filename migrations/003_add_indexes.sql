CREATE INDEX IF NOT EXISTS idx_documents_category ON documents (category);

CREATE INDEX IF NOT EXISTS idx_documents_tags ON documents USING GIN (tags);

CREATE INDEX IF NOT EXISTS idx_documents_updated_at ON documents (updated_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_document_chunks_document_chunk_index
  ON document_chunks (document_id, chunk_index);

CREATE INDEX IF NOT EXISTS idx_document_chunks_model_dimensions
  ON document_chunks (embedding_model, embedding_dimensions);

CREATE INDEX IF NOT EXISTS idx_document_chunks_category
  ON document_chunks (category);

CREATE INDEX IF NOT EXISTS idx_document_chunks_tags
  ON document_chunks USING GIN (tags);

-- Full-text search support for keyword search (Phase 6).
ALTER TABLE document_chunks
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (to_tsvector('english', chunk_text)) STORED;

CREATE INDEX IF NOT EXISTS idx_document_chunks_search_vector
  ON document_chunks USING GIN (search_vector);
