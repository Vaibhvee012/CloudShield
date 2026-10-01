import prisma from "../lib/prisma";
import { scanAWSSecurity } from "./securityScanner";

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
  }

  const currentFindingIds = findings.map((finding) => finding.id);

  const previousOpenFindings = await prisma.finding.findMany({
    where: {
      status: "OPEN",
      OR: [
        {
          id: {
            startsWith: "ec2-public-ip-",
          },
        },
        {
          id: {
            startsWith: "ec2-sg-ssh-",
          },
        },
        {
          id: {
            startsWith: "ec2-sg-rdp-",
          },
        },
        {
          id: {
            startsWith: "ec2-sg-open-all-",
          },
        },
        {
          id: {
            startsWith: "s3-public-access-",
          },
        },
        {
          id: {
            startsWith: "s3-encryption-",
          },
        },
        {
          id: {
            startsWith: "rds-public-access-",
          },
        },
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