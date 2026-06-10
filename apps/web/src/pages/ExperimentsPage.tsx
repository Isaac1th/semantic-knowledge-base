import { useState } from "react";

import { api } from "../api/client.js";

export function ExperimentsPage() {
  const [compareA, setCompareA] = useState("How do I reset my password?");
  const [compareB, setCompareB] = useState(
    "Instructions for changing login credentials",
  );
  const [compareResult, setCompareResult] = useState<Record<string, unknown> | null>(
    null,
  );

  const [chunkText, setChunkText] = useState(
    "Paragraph one with enough characters to demonstrate chunking behavior in this educational demo.\n\nParagraph two continues the example with separate paragraph-based chunks and optional overlap settings.",
  );
  const [strategy, setStrategy] = useState("fixed_chars");
  const [chunkSize, setChunkSize] = useState(120);
  const [overlap, setOverlap] = useState(20);
  const [chunkPreview, setChunkPreview] = useState<Record<string, unknown> | null>(
    null,
  );

  const [error, setError] = useState<string | null>(null);

  return (
    <section>
      <h2>Experiments</h2>

      <article style={{ marginBottom: "2rem" }}>
        <h3>Experiment 1: Keyword vs semantic search</h3>
        <p>
          Seed the sample password/login documents, then search for &quot;I forgot
          my password&quot; on the Search page. Vector search should surface
          paraphrased login content even when exact tokens differ.
        </p>
      </article>

      <article style={{ marginBottom: "2rem" }}>
        <h3>Experiment 2: Similarity comparison</h3>
        <div className="grid-form">
          <textarea value={compareA} onChange={(e) => setCompareA(e.target.value)} rows={3} />
          <textarea value={compareB} onChange={(e) => setCompareB(e.target.value)} rows={3} />
          <button
            type="button"
            onClick={async () => {
              setError(null);
              try {
                setCompareResult(await api.compareTexts(compareA, compareB));
              } catch (err) {
                setError(err instanceof Error ? err.message : "Compare failed");
              }
            }}
          >
            Compare texts
          </button>
        </div>
        {compareResult && (
          <pre>{JSON.stringify(compareResult, null, 2)}</pre>
        )}
      </article>

      <article style={{ marginBottom: "2rem" }}>
        <h3>Experiment 3: Chunking strategies</h3>
        <div className="grid-form">
          <textarea value={chunkText} onChange={(e) => setChunkText(e.target.value)} rows={6} />
          <label>
            Strategy
            <select value={strategy} onChange={(e) => setStrategy(e.target.value)}>
              <option value="fixed_chars">Fixed characters</option>
              <option value="fixed_words">Fixed words</option>
              <option value="paragraphs">Paragraphs</option>
            </select>
          </label>
          <label>
            Chunk size
            <input
              type="number"
              value={chunkSize}
              onChange={(e) => setChunkSize(Number(e.target.value))}
            />
          </label>
          <label>
            Overlap
            <input
              type="number"
              value={overlap}
              onChange={(e) => setOverlap(Number(e.target.value))}
            />
          </label>
          <button
            type="button"
            onClick={async () => {
              setError(null);
              try {
                setChunkPreview(
                  await api.previewChunks({
                    text: chunkText,
                    strategy,
                    chunkSize,
                    overlap,
                  }),
                );
              } catch (err) {
                setError(err instanceof Error ? err.message : "Chunk preview failed");
              }
            }}
          >
            Preview chunks
          </button>
        </div>
        {chunkPreview && (
          <pre>{JSON.stringify(chunkPreview, null, 2)}</pre>
        )}
      </article>

      <article style={{ marginBottom: "2rem" }}>
        <h3>Experiment 4: Metadata filtering</h3>
        <p>
          Use the Search page with category = <code>technical</code> or tags like{" "}
          <code>Node.js</code> to see vector similarity constrained by metadata.
        </p>
      </article>

      <article>
        <h3>Experiment 5: Embedding model isolation</h3>
        <p>
          Chunks are always filtered by <code>embedding_model</code> and{" "}
          <code>embedding_dimensions</code> in SQL. Embeddings from different models
          live in incompatible vector spaces and must never be compared directly.
        </p>
      </article>

      {error && <p className="error">{error}</p>}
    </section>
  );
}
