import { Router } from "express";

import {
  chunkTextSchema,
  compareTextsSchema,
  hybridSearchSchema,
  keywordSearchSchema,
  vectorSearchSchema,
} from "@skb/shared";

import { validateBody } from "../middleware/validate-body.js";
import type { ExperimentsService } from "../modules/experiments/service.js";
import type { HybridSearchService } from "../modules/hybrid-search/service.js";
import type { KeywordSearchService } from "../modules/keyword-search/service.js";
import type { VectorSearchService } from "../modules/vector-search/service.js";

export function createSearchRouter(deps: {
  keywordSearch: KeywordSearchService;
  vectorSearch: VectorSearchService;
  hybridSearch: HybridSearchService;
  experiments: ExperimentsService;
}): Router {
  const router = Router();

  router.post(
    "/keyword",
    validateBody(keywordSearchSchema),
    async (req, res, next) => {
      try {
        const result = await deps.keywordSearch.search(req.body);
        res.json(result);
      } catch (error) {
        next(error);
      }
    },
  );

  router.post(
    "/vector",
    validateBody(vectorSearchSchema),
    async (req, res, next) => {
      try {
        const result = await deps.vectorSearch.search(req.body);
        res.json(result);
      } catch (error) {
        next(error);
      }
    },
  );

  router.post(
    "/hybrid",
    validateBody(hybridSearchSchema),
    async (req, res, next) => {
      try {
        const result = await deps.hybridSearch.search(req.body);
        res.json(result);
      } catch (error) {
        next(error);
      }
    },
  );

  return router;
}

export function createExperimentsRouter(
  experiments: ExperimentsService,
): Router {
  const router = Router();

  router.post(
    "/compare-texts",
    validateBody(compareTextsSchema),
    async (req, res, next) => {
      try {
        const result = await experiments.compareTexts(
          req.body.textA,
          req.body.textB,
        );
        res.json(result);
      } catch (error) {
        next(error);
      }
    },
  );

  router.post(
    "/chunk-text",
    validateBody(chunkTextSchema),
    async (req, res, next) => {
      try {
        const result = experiments.previewChunks(req.body);
        res.json(result);
      } catch (error) {
        next(error);
      }
    },
  );

  return router;
}
