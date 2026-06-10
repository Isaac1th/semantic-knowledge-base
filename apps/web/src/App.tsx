import { useState } from "react";

import { DocumentsPage } from "./pages/DocumentsPage.js";
import { ExperimentsPage } from "./pages/ExperimentsPage.js";
import { SearchPage } from "./pages/SearchPage.js";

type Page = "documents" | "search" | "experiments";

export function App() {
  const [page, setPage] = useState<Page>("documents");

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", maxWidth: "960px" }}>
      <h1>Semantic Knowledge Base</h1>
      <p>Learning interface for embeddings, chunking, and vector search.</p>

      <nav style={{ display: "flex", gap: "0.75rem", marginBottom: "2rem" }}>
        <button type="button" onClick={() => setPage("documents")}>
          Documents
        </button>
        <button type="button" onClick={() => setPage("search")}>
          Search
        </button>
        <button type="button" onClick={() => setPage("experiments")}>
          Experiments
        </button>
      </nav>

      {page === "documents" && <DocumentsPage />}
      {page === "search" && <SearchPage />}
      {page === "experiments" && <ExperimentsPage />}
    </main>
  );
}
