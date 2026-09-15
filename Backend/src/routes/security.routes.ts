import { Router } from "express";
import { getSecurityPosture } from "../controllers/security.controller";

const router = Router();

router.get("/", getSecurityPosture);


export default router;