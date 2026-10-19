import { Router } from "express";
import {
  chatWithAI,
  explainFinding,
  prioritizeRisks,
  suggestRemediation,
} from "../controllers/ai.controller";
import { getDashboardInsight } from "../controllers/dashboardInsight.controller";
import { authenticate } from "../middleware/auth.middleware";
import { aiRateLimiter } from "../middleware/aiRateLimit";

const router = Router();

// Order matters: authenticate first so the limiter can key on the user.
router.use(authenticate);
router.use(aiRateLimiter);

router.post("/chat", chatWithAI);

router.post("/findings/:id/explain", explainFinding);

router.post("/risks/prioritize", prioritizeRisks);

router.post("/findings/:id/remediation", suggestRemediation);

router.get("/dashboard/insight", getDashboardInsight);

export default router;