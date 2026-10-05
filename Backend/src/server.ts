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

import { startScheduler } from "./jobs/scheduler";

const app = express();

/* Security */
app.use(helmet());

/* CORS */
app.use(
  cors({
    origin:
      process.env.FRONTEND_URL ||
      "http://localhost:5173",
  }),
);

/* Request parsing */
app.use(express.json());

/* Routes */
app.use("/api/health", healthRoutes);
app.use("/api/resources", resourcesRoutes);
app.use("/api/findings", findingsRoutes);
app.use("/api/security", securityRoutes);
app.use("/api/remediation", remediationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/aws", awsRoutes);
app.use("/api/ai", aiRoutes);

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
app.use(
  (
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    console.error("Unhandled server error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  },
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startScheduler();
});
