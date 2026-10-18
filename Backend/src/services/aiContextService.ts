import prisma from "../lib/prisma";

import {
  ownedFindings,
  ownedRemediations,
  ownedResources,
} from "../lib/ownership";
import { sanitizeText, severityRank } from "../lib/promptSafety";

const MAX_CONTEXT_FINDINGS = 25;
const MAX_CONTEXT_RESOURCES = 50;

export const buildSecurityContext = async (userId: string) => {
  const [
    totalResources,
    resources,
    findings,
    pendingRemediations,
  ] = await Promise.all([
    prisma.resource.count({
      where: {
        ...ownedResources(userId),
        status: { not: "disconnected" },
      },
    }),

    prisma.resource.findMany({
      where: {
        ...ownedResources(userId),
        status: { not: "disconnected" },
      },
      orderBy: { updatedAt: "desc" },
      take: MAX_CONTEXT_RESOURCES,
    }),

    prisma.finding.findMany({
      where: {
        ...ownedFindings(userId),
        status: { not: "RESOLVED" },
      },
      include: {
        resource: { select: { name: true } },
        remediation: { select: { status: true, title: true } },
      },
    }),

    prisma.remediationAction.count({
      where: {
        ...ownedRemediations(userId),
        status: { not: "COMPLETED" },
      },
    }),
  ]);

  const countBySeverity = (severity: string) =>
    findings.filter(
      (finding) => finding.severity.toUpperCase() === severity
    ).length;

  const critical = countBySeverity("CRITICAL");
  const high = countBySeverity("HIGH");
  const medium = countBySeverity("MEDIUM");
  const low = countBySeverity("LOW");

  const riskPoints =
    critical * 20 +
    high * 10 +
    medium * 5 +
    low * 2;

  const securityScore = Math.max(
    0,
    Math.min(100, 100 - riskPoints)
  );

  // Most severe first, then cap what is sent to the model.
  const topFindings = [...findings]
    .sort(
      (a, b) =>
        severityRank(a.severity) - severityRank(b.severity)
    )
    .slice(0, MAX_CONTEXT_FINDINGS);

  return {
    securityScore,

    summary: {
      totalResources,
      totalOpenFindings: findings.length,
      critical,
      high,
      medium,
      low,
      pendingRemediations,
      findingsListed: topFindings.length,
      resourcesListed: resources.length,
    },

    resources: resources.map((resource) => ({
      id: sanitizeText(resource.id, 200),
      name: sanitizeText(resource.name, 200),
      type: sanitizeText(resource.type, 50),
      region: sanitizeText(resource.region, 50),
      status: sanitizeText(resource.status, 30),
      environment: sanitizeText(resource.environment, 50),
      riskLevel: sanitizeText(resource.riskLevel, 20),
      source: sanitizeText(resource.source, 20),
    })),

    findings: topFindings.map((finding) => ({
      id: sanitizeText(finding.id, 200),
      title: sanitizeText(finding.title, 200),
      severity: sanitizeText(finding.severity, 20),
      resourceId: sanitizeText(finding.resourceId, 200),
      resourceName: sanitizeText(finding.resource?.name, 200),
      resourceType: sanitizeText(finding.resourceType, 50),
      region: sanitizeText(finding.region, 50),
      category: sanitizeText(finding.category, 100),
      status: sanitizeText(finding.status, 30),
      description: sanitizeText(finding.description, 500),
      remediationStatus: sanitizeText(
        finding.remediation?.status ?? "NOT_AVAILABLE",
        30
      ),
      remediationTitle: sanitizeText(finding.remediation?.title, 200),
    })),
  };
};