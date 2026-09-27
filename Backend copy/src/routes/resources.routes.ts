import { Router } from "express";
import { getResources } from "../controllers/resources.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authenticate, getResources);

export default router;