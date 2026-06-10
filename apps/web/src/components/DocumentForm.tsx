import { useState } from "react";

import type { DocumentDto } from "../api/client.js";

interface DocumentFormProps {
  initial?: DocumentDto;
  onSubmit: (values: {
    title: string;
    content: string;
    category: string;
    tags: string[];
  }) => Promise<void>;
  onCancel?: () => void;
}

export function DocumentForm({ initial, onSubmit, onCancel }: DocumentFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [tags, setTags] = useState(initial?.tags.join(", ") ?? "");
  const [saving, setSaving] = useState(false);

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        setSaving(true);
        try {
          await onSubmit({
            title,
            content,
            category,
            tags: tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean),
          });
        } finally {
          setSaving(false);
        }
      }}
      style={{ display: "grid", gap: "0.75rem", maxWidth: "720px" }}
    >
      <label>
        Title
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </label>
      <label>
        Content
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          required
        />
      </label>
      <label>
        Category
        <input value={category} onChange={(e) => setCategory(e.target.value)} />
      </label>
      <label>
        Tags (comma-separated)
        <input value={tags} onChange={(e) => setTags(e.target.value)} />
      </label>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : initial ? "Update" : "Create"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
