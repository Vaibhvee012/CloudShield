import { Router } from "express";
import {
  chatWithAI,
  explainFinding,
  prioritizeRisks,
} from "../controllers/ai.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/chat", authenticate, chatWithAI);

router.post(
  "/findings/:id/explain",
  authenticate,
  explainFinding
);

router.post(
  "/risks/prioritize",
  authenticate,
  prioritizeRisks
);

export default router;