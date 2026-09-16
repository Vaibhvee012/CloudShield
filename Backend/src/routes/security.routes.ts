import { Router } from "express";
import { getSecurityPosture } from "../controllers/security.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authenticate, getSecurityPosture);

export default router;