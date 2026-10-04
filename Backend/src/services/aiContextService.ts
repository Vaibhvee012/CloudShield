import prisma from "../lib/prisma";

export const buildSecurityContext = async () => {
  const [resources, findings, remediationActions] = await Promise.all([
    prisma.resource.findMany({
      orderBy: {
        updatedAt: "desc",
      },
    }),

    prisma.finding.findMany({
      where: {
        status: {
          not: "RESOLVED",
        },
      },
      include: {
        resource: true,
        remediation: true,
      },
      orderBy: {
        severity: "asc",
      },
    }),

    prisma.remediationAction.findMany({
      orderBy: {
        updatedAt: "desc",
      },
    }),
  ]);

  const critical = findings.filter(
    (finding) => finding.severity.toUpperCase() === "CRITICAL"
  ).length;

  const high = findings.filter(
    (finding) => finding.severity.toUpperCase() === "HIGH"
  ).length;

  const medium = findings.filter(
    (finding) => finding.severity.toUpperCase() === "MEDIUM"
  ).length;

  const low = findings.filter(
    (finding) => finding.severity.toUpperCase() === "LOW"
  ).length;

  const riskPoints =
    critical * 20 +
    high * 10 +
    medium * 5 +
    low * 2;

  const securityScore = Math.max(
    0,
    Math.min(100, 100 - riskPoints)
  );

  return {
    securityScore,

    summary: {
      totalResources: resources.length,
      totalOpenFindings: findings.length,
      critical,
      high,
      medium,
      low,
      pendingRemediations: remediationActions.filter(
        (action) => action.status !== "COMPLETED"
      ).length,
    },

    resources: resources.map((resource) => ({
      id: resource.id,
      name: resource.name,
      type: resource.type,
      region: resource.region,
      status: resource.status,
      environment: resource.environment,
      riskLevel: resource.riskLevel,
      source: resource.source,
    })),

    findings: findings.map((finding) => ({
      id: finding.id,
      title: finding.title,
      severity: finding.severity,
      resourceId: finding.resourceId,
      resourceName: finding.resource?.name,
      resourceType: finding.resourceType,
      region: finding.region,
      category: finding.category,
      status: finding.status,
      description: finding.description,
      remediationStatus: finding.remediation?.status ?? "NOT_AVAILABLE",
      remediationTitle: finding.remediation?.title,
    })),
  };
};

export const buildAIContextPrompt = async (question: string) => {
  const securityContext = await buildSecurityContext();

  return {
    securityContext,
    prompt: `
You are CloudShield AI, a cloud security assistant.

Analyze the user's question using the CloudShield security data provided below.

Rules:
- Use only the provided CloudShield data.
- Do not invent findings or resources.
- Prioritize critical and high severity issues.
- Give practical recommendations.
- Do not claim to have modified AWS resources.
- If the information is unavailable, say so clearly.

CloudShield Security Data:
${JSON.stringify(securityContext, null, 2)}

User Question:
${question}
`,
  };
};