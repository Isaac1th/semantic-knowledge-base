import { useState } from "react";

import { DocumentsPage } from "./pages/DocumentsPage.js";
import { ExperimentsPage } from "./pages/ExperimentsPage.js";
import { SearchPage } from "./pages/SearchPage.js";

type Page = "documents" | "search" | "experiments";

export function App() {
  const [page, setPage] = useState<Page>("documents");

  return (
    <main className="app">
      <h1>Semantic Knowledge Base</h1>
      <p>Learning interface for embeddings, chunking, and vector search.</p>

      <nav className="nav">
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
