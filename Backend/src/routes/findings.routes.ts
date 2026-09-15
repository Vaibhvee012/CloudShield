import { Router } from "express";
import { getFindings } from "../controllers/findings.controller";

const router = Router();

router.get("/", getFindings);

export default router;