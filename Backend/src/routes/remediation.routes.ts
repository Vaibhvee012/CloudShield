import { Router } from "express";
import { getRemediationActions } from "../controllers/remediation.controller";

const router = Router();

router.get("/", getRemediationActions);

export default router;
