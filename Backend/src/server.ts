import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import healthRoutes from "./routes/health.routes";
import resourcesRoutes from "./routes/resources.routes";
import findingsRoutes from "./routes/findings.routes";
import securityRoutes from "./routes/security.routes";
import remediationRoutes from "./routes/remediation.routes";
import authRoutes from "./routes/auth.routes";
import "dotenv/config";
import awsRoutes from "./routes/aws.routes";
import { startScheduler } from "./jobs/scheduler";

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());


// Routes
// Routes
app.use("/api/health", healthRoutes);
app.use("/api/resources", resourcesRoutes);
app.use("/api/findings", findingsRoutes);
app.use("/api/security", securityRoutes);
app.use("/api/remediation", remediationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/aws", awsRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  startScheduler();
});