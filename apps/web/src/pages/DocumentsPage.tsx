import { useEffect, useState } from "react";

import { api, type DocumentDto } from "../api/client.js";
import { DocumentForm } from "../components/DocumentForm.js";

export function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentDto[]>([]);
  const [editing, setEditing] = useState<DocumentDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const response = await api.listDocuments();
    setDocuments(response.documents);
  }

  useEffect(() => {
    refresh().catch((err: Error) => setError(err.message));
  }, []);

  return (
    <section>
      <h2>Documents</h2>
      {error && <p className="error">{error}</p>}

      <DocumentForm
        {...(editing ? { initial: editing } : {})}
        {...(editing ? { onCancel: () => setEditing(null) } : {})}
        onSubmit={async (values) => {
          if (editing) {
            await api.updateDocument(editing.id, values);
            setEditing(null);
          } else {
            await api.createDocument(values);
          }
          await refresh();
        }}
      />

      <ul style={{ marginTop: "2rem" }}>
        {documents.map((document) => (
          <li key={document.id} style={{ marginBottom: "1rem" }}>
            <strong>{document.title}</strong> — {document.chunkCount} chunks
            <div className="button-row" style={{ marginTop: "0.5rem" }}>
              <button type="button" onClick={() => setEditing(document)}>
                Edit
              </button>
              <button
                type="button"
                onClick={async () => {
                  await api.reindexDocument(document.id);
                  await refresh();
                }}
              >
                Reindex
              </button>
              <button
                type="button"
                onClick={async () => {
                  await api.deleteDocument(document.id);
                  await refresh();
                }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
