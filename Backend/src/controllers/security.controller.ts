import { Request, Response } from "express";
import prisma from "../lib/prisma";

export const getSecurityPosture = async (
  _req: Request,
  res: Response
) => {
  try {
    const findings = await prisma.finding.findMany();

    const resources = await prisma.resource.findMany();

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

    const resourceHealth =
      resources.length === 0
        ? 0
        : Math.round(
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
  } catch (error) {
    console.error("Failed to calculate security posture:", error);

    res.status(500).json({
      success: false,
      message: "Failed to calculate security posture",
    });
  }
};