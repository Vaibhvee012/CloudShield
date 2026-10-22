import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { getAuditLogs } from "../controllers/auditLog.controller";

const router = Router();

router.use(authenticate);

router.get("/", getAuditLogs);

export default router;