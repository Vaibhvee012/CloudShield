import prisma from "../lib/prisma";

export const calculateSecurityScore = async () => {
  const findings = await prisma.finding.findMany({
    where: {
      status: "OPEN",
    },
  });

  let score = 100;

  for (const finding of findings) {
    if (finding.severity === "CRITICAL") {
      score -= 25;
    } else if (finding.severity === "HIGH") {
      score -= 15;
    } else if (finding.severity === "MEDIUM") {
      score -= 10;
    } else if (finding.severity === "LOW") {
      score -= 5;
    }
  }

  score = Math.max(0, score);

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

  return {
    score,
    totalFindings: findings.length,
    severityBreakdown: {
      critical,
      high,
      medium,
      low,
    },
  };
};