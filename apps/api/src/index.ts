import "dotenv/config";

import express from "express";

import { loadEnv } from "./config/env.js";

const env = loadEnv();
const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "semantic-knowledge-base-api" });
});

app.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`);
});
