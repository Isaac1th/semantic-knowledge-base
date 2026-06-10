/**
 * Normalize text for consistent hashing and chunking.
 * Collapses whitespace and applies Unicode NFC normalization.
 */
export function normalizeText(text: string): string {
  return text.normalize("NFC").replace(/\s+/g, " ").trim();
}
