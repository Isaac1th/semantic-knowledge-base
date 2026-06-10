const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    throw new Error(body?.error?.message ?? `Request failed (${response.status})`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export interface DocumentDto {
  id: string;
  title: string;
  content: string;
  category: string | null;
  tags: string[];
  contentHash: string;
  createdAt: string;
  updatedAt: string;
  chunkCount: number;
}

export interface SearchResultItem {
  chunkText: string;
  documentTitle: string;
  documentId: string;
  chunkIndex: number;
  category: string | null;
  tags: string[];
  similarityScore: number;
  keywordScore?: number;
  combinedScore?: number;
}

export interface SearchResponse {
  query: string;
  embeddingModel?: string;
  embeddingDimensions?: number;
  queryEmbeddingPreview?: number[];
  results: SearchResultItem[];
}

export const api = {
  listDocuments: () =>
    request<{ documents: DocumentDto[] }>("/api/documents"),

  createDocument: (body: {
    title: string;
    content: string;
    category?: string;
    tags: string[];
  }) =>
    request<{ document: DocumentDto; indexed: boolean; chunkCount: number }>(
      "/api/documents",
      { method: "POST", body: JSON.stringify(body) },
    ),

  updateDocument: (
    id: string,
    body: Partial<{
      title: string;
      content: string;
      category: string;
      tags: string[];
    }>,
  ) =>
    request<{ document: DocumentDto; indexed: boolean; chunkCount: number }>(
      `/api/documents/${id}`,
      { method: "PUT", body: JSON.stringify(body) },
    ),

  deleteDocument: (id: string) =>
    request<void>(`/api/documents/${id}`, { method: "DELETE" }),

  reindexDocument: (id: string) =>
    request<{ document: DocumentDto; indexed: boolean; chunkCount: number }>(
      `/api/documents/${id}/reindex`,
      { method: "POST" },
    ),

  searchKeyword: (body: Record<string, unknown>) =>
    request<SearchResponse>("/api/search/keyword", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  searchVector: (body: Record<string, unknown>) =>
    request<SearchResponse>("/api/search/vector", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  searchHybrid: (body: Record<string, unknown>) =>
    request<SearchResponse>("/api/search/hybrid", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  compareTexts: (textA: string, textB: string) =>
    request<Record<string, unknown>>("/api/experiments/compare-texts", {
      method: "POST",
      body: JSON.stringify({ textA, textB }),
    }),

  previewChunks: (body: Record<string, unknown>) =>
    request<Record<string, unknown>>("/api/experiments/chunk-text", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
