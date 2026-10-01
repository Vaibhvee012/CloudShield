import {
  getEC2Instances,
  scanEC2SecurityGroups,
} from "./ec2Service";
import { getS3Buckets } from "./s3Service";
import { checkS3Encryption } from "./s3SecurityService";
import { getRDSInstances } from "./rdsService";
import { checkRootAccountMFA } from "./iamService";
export const scanAWSSecurity = async () => {
  const [
    ec2Instances,
    s3Buckets,
    rdsInstances,
    ec2SecurityGroupFindings,
  ] = await Promise.all([
    getEC2Instances(),
    getS3Buckets(),
    getRDSInstances(),
    scanEC2SecurityGroups(),
  ]);

  const rootMFAResult = await checkRootAccountMFA();

  const findings = [];

  // -------------------------
  // EC2 Security Checks
  // -------------------------

  for (const instance of ec2Instances) {
    if (!instance.id) {
      continue;
    }

    if (instance.publicIp) {
      findings.push({
        id: `ec2-public-ip-${instance.id}`,
        title: "EC2 Instance Has Public IP",
        severity: "HIGH",
        resourceId: instance.id,
        resourceType: "EC2",
        region: instance.region,
        status: "OPEN",
        category: "Network Exposure",
        description: `EC2 instance ${instance.name} has a public IP address and may be directly accessible from the internet.`,
      });
    }
  }

  // -------------------------
  // EC2 Security Group Checks
  // -------------------------

  findings.push(...ec2SecurityGroupFindings);

  // -------------------------
  // S3 Security Checks
  // -------------------------

  for (const bucket of s3Buckets) {
    if (!bucket.name) {
      continue;
    }

    // S3 Public Access
    if (!bucket.publicAccessBlocked) {
      findings.push({
        id: `s3-public-access-${bucket.name}`,
        title: "S3 Bucket Public Access Not Fully Blocked",
        severity: "HIGH",
        resourceId: `s3-${bucket.name}`,
        resourceType: "S3",
        region: bucket.region,
        status: "OPEN",
        category: "Data Exposure",
        description: `S3 bucket ${bucket.name} does not have all Public Access Block settings enabled.`,
      });
    }

    // S3 Encryption
    const encryptionResult = await checkS3Encryption(
      bucket.name
    );

    if (!encryptionResult.passed) {
      findings.push({
        id: `s3-encryption-${bucket.name}`,
        title: "S3 Bucket Does Not Have Default Encryption",
        severity: "HIGH",
        resourceId: `s3-${bucket.name}`,
        resourceType: "S3",
        region: bucket.region,
        status: "OPEN",
        category: "Data Protection",
        description: `S3 bucket ${bucket.name} does not have server-side encryption configured.`,
      });
    }
  }

  // -------------------------
  // RDS Security Checks
  // -------------------------

for (const db of rdsInstances) {
  if (!db.id) {
    continue;
  }

  if (db.publiclyAccessible) {
    findings.push({
      id: `rds-public-access-${db.id}`,
      title: "RDS Instance Is Publicly Accessible",
      severity: "CRITICAL",
      resourceId: db.id,
      resourceType: "RDS",
      region: db.region,
      status: "OPEN",
      category: "Database Exposure",
      description: `RDS database ${db.id} is configured to be publicly accessible.`,
    });
  }

  if (!db.storageEncrypted) {
    findings.push({
      id: `rds-unencrypted-${db.id}`,
      title: "RDS Instance Storage Is Not Encrypted",
      severity: "HIGH",
      resourceId: db.id,
      resourceType: "RDS",
      region: db.region,
      status: "OPEN",
      category: "Data Protection",
      description: `RDS database ${db.id} does not have storage encryption enabled.`,
    });
  }
}

if (!rootMFAResult.passed) {
  findings.push({
    id: "iam-root-mfa-disabled",
    title: "AWS Root Account MFA Is Disabled",
    severity: "CRITICAL",
    resourceId: "aws-account",
    resourceType: "IAM",
    region: process.env.AWS_REGION || "global",
    status: "OPEN",
    category: "Identity & Access",
    description:
      "The AWS root account does not have multi-factor authentication enabled.",
  });
}
  return findings;
};