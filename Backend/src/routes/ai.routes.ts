import { Router } from "express";
import {
  chatWithAI,
  explainFinding,
  getDashboardInsight,
  prioritizeRisks,
  suggestRemediation,
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

router.post(
  "/findings/:id/remediation",
  authenticate,
  suggestRemediation
);

router.get(
  "/dashboard/insight",
  authenticate,
  getDashboardInsight
);

export default router;