import { createHash } from "node:crypto";

import { normalizeText } from "./normalize.js";

export function computeContentHash(text: string): string {
  return createHash("sha256").update(normalizeText(text)).digest("hex");
}
