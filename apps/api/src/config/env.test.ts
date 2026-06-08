import { afterEach, describe, expect, it } from "vitest";

import { loadEnv } from "./env.js";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("loadEnv", () => {
  it("loads defaults for optional values", () => {
    process.env["DATABASE_URL"] = "postgresql://skb:skb@localhost:5432/semantic_kb";

    const env = loadEnv();

    expect(env.PORT).toBe(3001);
    expect(env.EMBEDDING_PROVIDER).toBe("mock");
    expect(env.EMBEDDING_DIMENSIONS).toBe(1536);
  });

  it("throws when DATABASE_URL is missing", () => {
    delete process.env["DATABASE_URL"];

    expect(() => loadEnv()).toThrow(/Invalid environment configuration/);
  });
});
