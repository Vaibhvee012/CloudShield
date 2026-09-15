import { Router } from "express";
import { getResources } from "../controllers/resources.controller";

const router = Router();

router.get("/", getResources);

export default router;