export const findings = [
  {
    id: "FND-001",
    title: "S3 bucket allows public access",
    severity: "Critical",
    resource: "cloudshield-production-data",
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
    resource: "staging-api-server",
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
    resource: "CloudShieldAdminRole",
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
    resource: "cloudshield-production-db",
    resourceType: "RDS",
    region: "ap-south-1",
    status: "Resolved",
    category: "Data Protection",
    description:
      "Database storage encryption should be enabled to protect data at rest.",
  },
];