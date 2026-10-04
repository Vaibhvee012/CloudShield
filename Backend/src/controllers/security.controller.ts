import { Request, Response } from "express";
import prisma from "../lib/prisma";

export const getSecurityPosture = async (
  _req: Request,
  res: Response
) => {
  try {
    // Only active security findings should affect the score
    const findings = await prisma.finding.findMany({
      where: {
        status: "OPEN",
      },
    });

    const resources = await prisma.resource.findMany();

    // -------------------------
    // Finding Severity Counts
    // -------------------------

    const critical = findings.filter(
      (finding) => finding.severity === "CRITICAL"
    ).length;

    const high = findings.filter(
      (finding) => finding.severity === "HIGH"
    ).length;

    const medium = findings.filter(
      (finding) => finding.severity === "MEDIUM"
    ).length;

    const low = findings.filter(
      (finding) => finding.severity === "LOW"
    ).length;

    const totalFindings = findings.length;

    // -------------------------
    // Security Score
    // -------------------------

    const riskPoints =
      critical * 20 +
      high * 10 +
      medium * 5 +
      low * 2;

    const securityScore = Math.max(
      0,
      Math.min(100, 100 - riskPoints)
    );

    // -------------------------
    // Resource Health
    // -------------------------

    const resourcesWithFindings = new Set(
      findings.map((finding) => finding.resourceId)
    );

    const healthyResources = resources.filter(
      (resource) =>
        !resourcesWithFindings.has(resource.id) &&
        (
          resource.status === "Healthy" ||
          resource.status === "running" ||
          resource.status === "available" ||
          resource.status === "active"
        )
    ).length;

    const resourceHealth =
      resources.length === 0
        ? 0
        : Math.round(
            (healthyResources / resources.length) * 100
          );

    // -------------------------
    // Response
    // -------------------------

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
    console.error(
      "Failed to calculate security posture:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to calculate security posture",
    });
  }
};