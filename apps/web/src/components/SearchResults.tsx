import type { SearchResultItem } from "../api/client.js";

interface SearchResultsProps {
  results: SearchResultItem[];
  mode: "keyword" | "vector" | "hybrid";
}

export function SearchResults({ results, mode }: SearchResultsProps) {
  if (results.length === 0) {
    return <p>No results found.</p>;
  }

  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {results.map((result) => (
        <li
          key={`${result.documentId}-${result.chunkIndex}`}
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "1rem",
            marginBottom: "0.75rem",
          }}
        >
          <p>
            <strong>{result.documentTitle}</strong> (chunk {result.chunkIndex})
          </p>
          <p>{result.chunkText}</p>
          <p>
            <small>
              Category: {result.category ?? "none"} | Tags:{" "}
              {result.tags.join(", ") || "none"}
            </small>
          </p>
          {mode !== "keyword" && (
            <p>
              <small>Similarity: {result.similarityScore.toFixed(4)}</small>
            </p>
          )}
          {mode !== "vector" && result.keywordScore !== undefined && (
            <p>
              <small>Keyword score: {result.keywordScore.toFixed(4)}</small>
            </p>
          )}
          {mode === "hybrid" && result.combinedScore !== undefined && (
            <p>
              <small>Combined score: {result.combinedScore.toFixed(4)}</small>
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
