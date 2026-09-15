import { Request, Response } from "express";
import { findings } from "../data/findings.data";
import { resources } from "../data/resources.data";

export const getSecurityPosture = (_req: Request, res: Response) => {
  const critical = findings.filter(
    (finding) => finding.severity === "Critical"
  ).length;

  const high = findings.filter(
    (finding) => finding.severity === "High"
  ).length;

  const medium = findings.filter(
    (finding) => finding.severity === "Medium"
  ).length;

  const low = findings.filter(
    (finding) => finding.severity === "Low"
  ).length;

  const totalFindings = findings.length;

  // Simple weighted risk calculation
  const riskPoints =
    critical * 20 +
    high * 10 +
    medium * 5 +
    low * 2;

  const securityScore = Math.max(
    0,
    Math.min(100, 100 - riskPoints)
  );

  const healthyResources = resources.filter(
    (resource) => resource.status === "Healthy"
  ).length;

  const resourceHealth = Math.round(
    (healthyResources / resources.length) * 100
  );

  res.json({
    success: true,
    data: {
      securityScore,
      totalFindings,
      severity: {
        critical,
        high,
        medium,
        low,
      },
      resources: {
        total: resources.length,
        healthy: healthyResources,
        healthPercentage: resourceHealth,
      },
    },
  });
};