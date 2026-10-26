import rateLimit from "express-rate-limit";
import { AuthRequest } from "./auth.middleware";

// Tests turn limits on explicitly (TEST_RATE_LIMITS=on) so that every other
// test can call the AI endpoints freely.
const skipInTests = () =>
  process.env.NODE_ENV === "test" && process.env.TEST_RATE_LIMITS !== "on";

// 10 AI requests per minute per signed-in user, shared across all AI routes.
// In-memory: resets on server restart and is not shared between instances.
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: skipInTests,
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
