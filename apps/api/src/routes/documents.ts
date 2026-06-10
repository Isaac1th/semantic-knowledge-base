import { Router } from "express";

import {
  createDocumentSchema,
  updateDocumentSchema,
} from "@skb/shared";

import { validateBody } from "../middleware/validate-body.js";
import type { DocumentService } from "../modules/documents/service.js";

export function createDocumentsRouter(service: DocumentService): Router {
  const router = Router();

  router.get("/", async (_req, res, next) => {
    try {
      const documents = await service.listDocuments();
      res.json({ documents });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id", async (req, res, next) => {
    try {
      const document = await service.getDocument(String(req.params.id));
      res.json({ document });
    } catch (error) {
      next(error);
    }
  });

  router.post(
    "/",
    validateBody(createDocumentSchema),
    async (req, res, next) => {
      try {
        const result = await service.createDocument(req.body);
        res.status(201).json(result);
      } catch (error) {
        next(error);
      }
    },
  );

  router.put(
    "/:id",
    validateBody(updateDocumentSchema),
    async (req, res, next) => {
      try {
        const result = await service.updateDocument(String(req.params.id), req.body);
        res.json(result);
      } catch (error) {
        next(error);
      }
    },
  );

  router.delete("/:id", async (req, res, next) => {
    try {
      await service.deleteDocument(String(req.params.id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  router.post("/:id/reindex", async (req, res, next) => {
    try {
      const result = await service.reindexDocument(String(req.params.id));
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
