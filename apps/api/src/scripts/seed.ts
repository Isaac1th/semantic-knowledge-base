import "dotenv/config";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { closePool, getPool } from "../db/pool.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedFile = path.resolve(
  __dirname,
  "../../../../../seeds/sample-documents.sql",
);

async function runSeed(): Promise<void> {
  const sql = await readFile(seedFile, "utf8");
  const pool = getPool();

  await pool.query(sql);
  console.log("Seed data applied.");
}

runSeed()
  .catch((error: unknown) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closePool();
  });
