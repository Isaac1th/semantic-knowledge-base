import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export interface EvaluationQuery {
  id: string;
  query: string;
  relevantDocumentIds: string[];
  irrelevantDocumentIds: string[];
}

export interface EvaluationDataset {
  description: string;
  queries: EvaluationQuery[];
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function loadEvaluationDataset(): Promise<EvaluationDataset> {
  const datasetPath = path.resolve(
    __dirname,
    "../../../../../seeds/evaluation-dataset.json",
  );
  const raw = await readFile(datasetPath, "utf8");
  return JSON.parse(raw) as EvaluationDataset;
}
