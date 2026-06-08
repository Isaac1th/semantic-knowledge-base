import { describe, expect, it } from "vitest";

import { EMBEDDING_DIMENSIONS_DEFAULT, EMBEDDING_MODEL_DEFAULT } from "./index.js";

describe("shared constants", () => {
  it("defines default embedding configuration", () => {
    expect(EMBEDDING_DIMENSIONS_DEFAULT).toBe(1536);
    expect(EMBEDDING_MODEL_DEFAULT).toBe("text-embedding-3-small");
  });
});
