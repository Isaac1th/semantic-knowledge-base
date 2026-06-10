import { Router } from "express";
import { z } from "zod";

import { validateBody } from "../middleware/validate-body.js";
import type { EvaluationService } from "../modules/evaluation/service.js";

const evaluationRequestSchema = z.object({
  topK: z.coerce.number().int().positive().max(50).default(5),
});

export function createEvaluationRouter(service: EvaluationService): Router {
  const router = Router();

  router.post(
    "/run",
    validateBody(evaluationRequestSchema),
    async (req, res, next) => {
      try {
        const result = await service.run(req.body.topK);
        res.json(result);
      } catch (error) {
        next(error);
      }
    },
  );

  return router;
}
