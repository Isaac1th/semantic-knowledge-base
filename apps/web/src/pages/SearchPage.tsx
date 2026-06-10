import { useState } from "react";

import { api, type SearchResponse } from "../api/client.js";
import { DebugPanel } from "../components/DebugPanel.js";
import { SearchResults } from "../components/SearchResults.js";

type SearchMode = "keyword" | "vector" | "hybrid";

export function SearchPage() {
  const [mode, setMode] = useState<SearchMode>("vector");
  const [query, setQuery] = useState("I forgot my password");
  const [topK, setTopK] = useState(5);
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [threshold, setThreshold] = useState("");
  const [vectorWeight, setVectorWeight] = useState(0.7);
  const [keywordWeight, setKeywordWeight] = useState(0.3);
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function runSearch(searchMode: SearchMode) {
    setLoading(true);
    setError(null);

    const payload: Record<string, unknown> = {
      query,
      topK,
      ...(category ? { category } : {}),
      ...(tags
        ? { tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean) }
        : {}),
    };

    if (searchMode !== "keyword" && threshold) {
      payload.threshold = Number(threshold);
    }

    if (searchMode === "hybrid") {
      payload.vectorWeight = vectorWeight;
      payload.keywordWeight = keywordWeight;
    }

    try {
      const result =
        searchMode === "keyword"
          ? await api.searchKeyword(payload)
          : searchMode === "vector"
            ? await api.searchVector(payload)
            : await api.searchHybrid(payload);

      setResponse(result);
      setMode(searchMode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h2>Search</h2>
      <p>Compare keyword, vector, and hybrid retrieval side by side.</p>

      <div className="grid-form">
        <label>
          Query
          <input value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <label>
          Top K
          <input
            type="number"
            value={topK}
            onChange={(e) => setTopK(Number(e.target.value))}
          />
        </label>
        <label>
          Category filter
          <input value={category} onChange={(e) => setCategory(e.target.value)} />
        </label>
        <label>
          Tags filter
          <input value={tags} onChange={(e) => setTags(e.target.value)} />
        </label>
        <label>
          Similarity threshold (vector/hybrid)
          <input value={threshold} onChange={(e) => setThreshold(e.target.value)} />
        </label>
        <label>
          Vector weight (hybrid)
          <input
            type="number"
            step="0.1"
            value={vectorWeight}
            onChange={(e) => setVectorWeight(Number(e.target.value))}
          />
        </label>
        <label>
          Keyword weight (hybrid)
          <input
            type="number"
            step="0.1"
            value={keywordWeight}
            onChange={(e) => setKeywordWeight(Number(e.target.value))}
          />
        </label>
      </div>

      <div className="button-row" style={{ marginTop: "1rem" }}>
        <button type="button" disabled={loading} onClick={() => runSearch("keyword")}>
          Keyword
        </button>
        <button type="button" disabled={loading} onClick={() => runSearch("vector")}>
          Vector
        </button>
        <button type="button" disabled={loading} onClick={() => runSearch("hybrid")}>
          Hybrid
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      {loading && <p>Searching...</p>}

      <DebugPanel response={response} mode={mode} />
      {response && <SearchResults results={response.results} mode={mode} />}
    </section>
  );
}
