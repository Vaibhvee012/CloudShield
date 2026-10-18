import rateLimit from "express-rate-limit";
import { AuthRequest } from "./auth.middleware";

// 10 AI requests per minute per signed-in user, shared across all AI routes.
// In-memory: resets on server restart and is not shared between instances.
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) =>
    (req as AuthRequest).user?.userId ?? "unauthenticated",
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message:
        "Too many AI requests. Please wait a minute and try again.",
    });
  },
});