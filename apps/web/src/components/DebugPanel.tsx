import type { SearchResponse } from "../api/client.js";

interface DebugPanelProps {
  response: SearchResponse | null;
  mode: "keyword" | "vector" | "hybrid";
}

export function DebugPanel({ response, mode }: DebugPanelProps) {
  if (!response) {
    return null;
  }

  return (
    <section className="panel">
      <h3>Debug panel</h3>
      <p>
        <strong>Query:</strong> {response.query}
      </p>
      {mode !== "keyword" && (
        <>
          <p>
            <strong>Embedding model:</strong> {response.embeddingModel ?? "n/a"}
          </p>
          <p>
            <strong>Dimensions:</strong>{" "}
            {response.embeddingDimensions ?? "n/a"}
          </p>
          <p>
            <strong>Query embedding preview:</strong>{" "}
            {response.queryEmbeddingPreview?.join(", ") ?? "n/a"}
          </p>
        </>
      )}
    </section>
  );
}
