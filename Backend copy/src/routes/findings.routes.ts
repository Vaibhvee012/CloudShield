import { Router } from "express";
import { getFindings } from "../controllers/findings.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authenticate, getFindings);

export default router;