import "dotenv/config";

import express, {
  NextFunction,
  Request,
  Response,
} from "express";
import cors from "cors";
import helmet from "helmet";

import healthRoutes from "./routes/health.routes";
import resourcesRoutes from "./routes/resources.routes";
import findingsRoutes from "./routes/findings.routes";
import securityRoutes from "./routes/security.routes";
import remediationRoutes from "./routes/remediation.routes";
import authRoutes from "./routes/auth.routes";
import awsRoutes from "./routes/aws.routes";
import aiRoutes from "./routes/ai.routes";
import auditLogRoutes from "./routes/auditLog.routes";

import { validateEnvironment } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

/* Environment validation */
validateEnvironment();

/* Security */
app.use(helmet());

const frontendUrl = process.env.FRONTEND_URL;

if (!frontendUrl) {
  throw new Error("FRONTEND_URL is not configured");
}

app.use(
  cors({
    origin: frontendUrl,
  }),
);

/* Request parsing */
app.use(express.json({ limit: "1mb" }));

/* Routes */
app.use("/api/health", healthRoutes);
app.use("/api/resources", resourcesRoutes);
app.use("/api/findings", findingsRoutes);
app.use("/api/security", securityRoutes);
app.use("/api/remediation", remediationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/aws", awsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/audit-logs", auditLogRoutes);

/* 404 handler */
app.use(
  (
    _req: Request,
    res: Response,
  ) => {
    return res.status(404).json({
      success: false,
      message: "API route not found",
    });
  },
);

/* Global error handler */
app.use(errorHandler);

export default app;