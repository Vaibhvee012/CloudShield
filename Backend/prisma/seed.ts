import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  await prisma.remediationAction.deleteMany();
  await prisma.finding.deleteMany();
  await prisma.resource.deleteMany();

  await prisma.resource.createMany({
    data: [
      {
        id: "i-0a123456789",
        name: "production-api-server",
        type: "EC2",
        region: "ap-south-1",
        status: "Healthy",
        environment: "Production",
        riskLevel: "Low",
      },
      {
        id: "i-0b987654321",
        name: "staging-api-server",
        type: "EC2",
        region: "ap-south-1",
        status: "Warning",
        environment: "Staging",
        riskLevel: "Medium",
      },
      {
        id: "bucket-cloudshield-prod",
        name: "cloudshield-production-data",
        type: "S3",
        region: "ap-south-1",
        status: "Critical",
        environment: "Production",
        riskLevel: "High",
      },
      {
        id: "db-cloudshield-prod",
        name: "cloudshield-production-db",
        type: "RDS",
        region: "ap-south-1",
        status: "Healthy",
        environment: "Production",
        riskLevel: "Low",
      },
      {
        id: "role-cloudshield-admin",
        name: "CloudShieldAdminRole",
        type: "IAM",
        region: "global",
        status: "Warning",
        environment: "Production",
        riskLevel: "Medium",
      },
    ],
  });

  await prisma.finding.createMany({
    data: [
      {
        id: "FND-001",
        title: "S3 bucket allows public access",
        severity: "Critical",
        resourceId: "bucket-cloudshield-prod",
        resourceType: "S3",
        region: "ap-south-1",
        status: "Open",
        category: "Data Exposure",
        description:
          "The S3 bucket is publicly accessible and may expose sensitive production data.",
      },
      {
        id: "FND-002",
        title: "Security group allows unrestricted SSH access",
        severity: "High",
        resourceId: "i-0b987654321",
        resourceType: "EC2",
        region: "ap-south-1",
        status: "Open",
        category: "Network Security",
        description:
          "Port 22 is accessible from the public internet.",
      },
      {
        id: "FND-003",
        title: "IAM role has excessive permissions",
        severity: "High",
        resourceId: "role-cloudshield-admin",
        resourceType: "IAM",
        region: "global",
        status: "Open",
        category: "Identity & Access",
        description:
          "The IAM role contains permissions that exceed the expected access requirements.",
      },
      {
        id: "FND-004",
        title: "RDS encryption is not enabled",
        severity: "Medium",
        resourceId: "db-cloudshield-prod",
        resourceType: "RDS",
        region: "ap-south-1",
        status: "Resolved",
        category: "Data Protection",
        description:
          "Database storage encryption should be enabled to protect data at rest.",
      },
    ],
  });

  await prisma.remediationAction.createMany({
    data: [
      {
        id: "REM-001",
        findingId: "FND-001",
        title: "Block public access to S3 bucket",
        action: "Enable S3 Block Public Access",
        status: "Recommended",
        riskReduction: "High",
      },
      {
        id: "REM-002",
        findingId: "FND-002",
        title: "Restrict SSH access",
        action: "Allow SSH only from trusted IP addresses",
        status: "Recommended",
        riskReduction: "High",
      },
      {
        id: "REM-003",
        findingId: "FND-003",
        title: "Reduce IAM permissions",
        action: "Remove unnecessary IAM permissions",
        status: "Recommended",
        riskReduction: "Medium",
      },
      {
        id: "REM-004",
        findingId: "FND-004",
        title: "Enable RDS encryption",
        action: "Enable encryption at rest",
        status: "Completed",
        riskReduction: "Medium",
      },
    ],
  });

  console.log("CloudShield database seeded successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });