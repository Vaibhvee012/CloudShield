import prisma from "../lib/prisma";
import { scanAWSSecurity } from "./securityScanner";

const getRemediationDetails = (finding: {
  id: string;
  title: string;
  severity: string;
}) => {
  const id = finding.id;

  if (id.startsWith("ec2-public-ip-")) {
    return {
      action:
        "Review the EC2 instance and remove the public IP if direct internet access is not required.",
      riskReduction: "High",
    };
  }

  if (
    id.startsWith("ec2-sg-ssh-") ||
    id.startsWith("ec2-sg-rdp-") ||
    id.startsWith("ec2-sg-open-all-")
  ) {
    return {
      action:
        "Restrict the security group's inbound rules to trusted IP ranges and required ports only.",
      riskReduction: "High",
    };
  }

  if (id.startsWith("s3-public-access-")) {
    return {
      action:
        "Enable all S3 Block Public Access settings and verify that the bucket does not require public access.",
      riskReduction: "High",
    };
  }

  if (id.startsWith("s3-encryption-")) {
    return {
      action:
        "Enable default server-side encryption for the S3 bucket.",
      riskReduction: "High",
    };
  }

  if (id.startsWith("s3-versioning-")) {
    return {
      action:
        "Enable S3 bucket versioning to protect against accidental deletion and object overwrites.",
      riskReduction: "Medium",
    };
  }

  if (id.startsWith("s3-logging-")) {
    return {
      action:
        "Enable server access logging for the S3 bucket to improve monitoring and audit visibility.",
      riskReduction: "Medium",
    };
  }

  if (id.startsWith("rds-public-access-")) {
    return {
      action:
        "Disable public accessibility for the RDS instance and place the database inside a private network.",
      riskReduction: "Critical",
    };
  }

  if (id.startsWith("rds-unencrypted-")) {
    return {
      action:
        "Enable storage encryption for the RDS instance using an appropriate KMS key.",
      riskReduction: "High",
    };
  }

  if (id.startsWith("rds-no-backup-")) {
    return {
      action:
        "Enable automated backups and configure an appropriate backup retention period.",
      riskReduction: "High",
    };
  }

  if (id.startsWith("iam-root-mfa-disabled")) {
    return {
      action:
        "Enable multi-factor authentication on the AWS root account immediately.",
      riskReduction: "Critical",
    };
  }

  if (id.startsWith("iam-old-access-key-")) {
    return {
      action:
        "Rotate or deactivate the IAM access key and use short-lived credentials where possible.",
      riskReduction: "High",
    };
  }

  return {
    action:
      "Review the security finding and apply the recommended AWS security best practice.",
    riskReduction:
      finding.severity === "CRITICAL"
        ? "Critical"
        : finding.severity === "HIGH"
          ? "High"
          : "Medium",
  };
};

export const syncAWSSecurityFindings = async () => {
  const findings = await scanAWSSecurity();

  const syncedFindings = [];

  for (const finding of findings) {
    const resource = await prisma.resource.findUnique({
      where: {
        id: finding.resourceId,
      },
    });

    if (!resource) {
      console.warn(
        `Skipping finding ${finding.id}: resource ${finding.resourceId} not found`
      );
      continue;
    }

    const syncedFinding = await prisma.finding.upsert({
      where: {
        id: finding.id,
      },
      update: {
        title: finding.title,
        severity: finding.severity,
        resourceId: finding.resourceId,
        resourceType: finding.resourceType,
        region: finding.region,
        status: "OPEN",
        category: finding.category,
        description: finding.description,
      },
      create: {
        id: finding.id,
        title: finding.title,
        severity: finding.severity,
        resourceId: finding.resourceId,
        resourceType: finding.resourceType,
        region: finding.region,
        status: "OPEN",
        category: finding.category,
        description: finding.description,
      },
    });

    syncedFindings.push(syncedFinding);

    const remediation = getRemediationDetails(finding);

    await prisma.remediationAction.upsert({
      where: {
        findingId: finding.id,
      },
      update: {
        title: `Remediate: ${finding.title}`,
        action: remediation.action,
        riskReduction: remediation.riskReduction,
      },
      create: {
        id: `remediation-${finding.id}`,
        findingId: finding.id,
        title: `Remediate: ${finding.title}`,
        action: remediation.action,
        status: "PENDING",
        riskReduction: remediation.riskReduction,
      },
    });
  }

  const currentFindingIds = findings.map(
    (finding) => finding.id
  );

  const previousOpenFindings =
    await prisma.finding.findMany({
      where: {
        status: "OPEN",
        OR: [
          { id: { startsWith: "ec2-public-ip-" } },
          { id: { startsWith: "ec2-sg-ssh-" } },
          { id: { startsWith: "ec2-sg-rdp-" } },
          { id: { startsWith: "ec2-sg-open-all-" } },
          { id: { startsWith: "s3-public-access-" } },
          { id: { startsWith: "s3-encryption-" } },
          { id: { startsWith: "s3-versioning-" } },
          { id: { startsWith: "s3-logging-" } },
          { id: { startsWith: "rds-public-access-" } },
          { id: { startsWith: "rds-unencrypted-" } },
          { id: { startsWith: "rds-no-backup-" } },
          { id: { startsWith: "iam-root-mfa-disabled" } },
          { id: { startsWith: "iam-old-access-key-" } },
        ],
      },
    });

  for (const finding of previousOpenFindings) {
    if (!currentFindingIds.includes(finding.id)) {
      await prisma.finding.update({
        where: {
          id: finding.id,
        },
        data: {
          status: "RESOLVED",
        },
      });
    }
  }

  return syncedFindings;
};