import { Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest, requireUserId } from "../middleware/auth.middleware";
import { ownedFindings, ownedResources } from "../lib/ownership";

export const getSecurityPosture = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    // Only this user's active findings affect the score
    const findings = await prisma.finding.findMany({
      where: {
        ...ownedFindings(userId),
        status: "OPEN",
      },
    });

    const resources = await prisma.resource.findMany({
      where: ownedResources(userId),
    });

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

    const riskPoints =
      critical * 20 +
      high * 10 +
      medium * 5 +
      low * 2;

    const securityScore = Math.max(
      0,
      Math.min(100, 100 - riskPoints)
    );

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