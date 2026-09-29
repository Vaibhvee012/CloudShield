import prisma from "../lib/prisma";
import { scanS3Security } from "./s3SecurityService";

export const syncS3SecurityFindings = async () => {
  const results = await scanS3Security();

  const findings = [];

  for (const result of results) {
    const resourceId = `s3-${result.bucketName}`;

    const resource = await prisma.resource.findUnique({
      where: {
        id: resourceId,
      },
    });

    if (!resource) {
      console.log(
        `Resource not found for bucket: ${result.bucketName}`
      );
      continue;
    }

    // No finding needed when the security check passes.
    if (result.passed) {
      continue;
    }

    const findingId = `s3-${result.check
      .toLowerCase()
      .replace(/\s+/g, "-")}-${result.bucketName}`;

    const finding = await prisma.finding.upsert({
      where: {
        id: findingId,
      },
      update: {
        title: result.check,
        severity: result.severity,
        status: "OPEN",
        category: "S3 Security",
        description: result.message,
      },
      create: {
        id: findingId,
        title: result.check,
        severity: result.severity,
        resourceId: resource.id,
        resourceType: "S3",
        region: resource.region,
        status: "OPEN",
        category: "S3 Security",
        description: result.message,
      },
    });

    findings.push(finding);
  }

  return findings;
};