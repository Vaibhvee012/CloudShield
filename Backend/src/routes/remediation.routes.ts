import { Router } from "express";
import { getRemediationActions } from "../controllers/remediation.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authenticate, getRemediationActions);

export default router;