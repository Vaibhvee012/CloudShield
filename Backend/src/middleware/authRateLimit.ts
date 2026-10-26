import rateLimit from "express-rate-limit";
import { writeAudit, AuditAction } from "../lib/auditLog";

// Limits can be raised in development (for example while running scripts that
// create many users) with AUTH_LOGIN_LIMIT and AUTH_REGISTER_LIMIT.
const loginLimit = Number(process.env.AUTH_LOGIN_LIMIT) || 10;
const registerLimit = Number(process.env.AUTH_REGISTER_LIMIT) || 10;

// Tests turn limits on explicitly (TEST_RATE_LIMITS=on) so that every other
// test can register and sign in freely.
const skipInTests = () =>
  process.env.NODE_ENV === "test" && process.env.TEST_RATE_LIMITS !== "on";

const build = (options: {
  action: string;
  windowMs: number;
  limit: number;
  countOnlyFailures: boolean;
  message: string;
}) =>
  rateLimit({
    windowMs: options.windowMs,
    limit: options.limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    skipSuccessfulRequests: options.countOnlyFailures,
    skip: skipInTests,
    handler: async (req, res) => {
      await writeAudit({
        action: options.action,
        outcome: "DENIED",
        metadata: { reason: "rate_limited" },
        ip: req.ip,
      });

      res.status(429).json({
        success: false,
        message: options.message,
      });
    },
  });

// Only failed sign-ins use up the budget, so normal use is never blocked.
export const loginRateLimiter = build({
  action: AuditAction.AUTH_LOGIN,
  windowMs: 15 * 60 * 1000,
  limit: loginLimit,
  countOnlyFailures: true,
  message: "Too many failed sign-in attempts. Please try again in 15 minutes.",
});

export const registerRateLimiter = build({
  action: AuditAction.AUTH_REGISTER,
  windowMs: 60 * 60 * 1000,
  limit: registerLimit,
  countOnlyFailures: false,
  message: "Too many sign-up attempts. Please try again later.",
});
