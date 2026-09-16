import { Router, Response } from "express";
import {
  register,
  login,
} from "../controllers/auth.controller";
import {
  authenticate,
  AuthRequest,
  authorize,
} from "../middleware/auth.middleware";

const router = Router();

router.post("/register", register);

router.post("/login", login);

router.get("/me", authenticate, (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    message: "Authentication successful",
    user: req.user,
  });
});

router.get(
  "/admin-test",
  authenticate,
  authorize("ADMIN"),
  (req: AuthRequest, res: Response) => {
    res.json({
      success: true,
      message: "Admin access granted",
      user: req.user,
    });
  }
);

export default router;