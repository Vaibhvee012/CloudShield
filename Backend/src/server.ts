import express from "express";
import cors from "cors";
import helmet from "helmet";

const app = express();

const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "CloudShield API is running",
  });
});

app.listen(PORT, () => {
  console.log(`CloudShield API running on port ${PORT}`);
});