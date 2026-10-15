import {
  getEC2Instances,
  scanEC2SecurityGroups,
} from "./ec2Service";

import { getS3Buckets } from "./s3Service";

import {
  checkS3Encryption,
  checkS3Versioning,
  checkS3Logging,
} from "./s3SecurityService";

import { getRDSInstances } from "./rdsService";

import {
  checkRootAccountMFA,
  scanIAMAccessKeys,
} from "./iamService";

import { EC2Client } from "@aws-sdk/client-ec2";
import { S3Client } from "@aws-sdk/client-s3";
import { RDSClient } from "@aws-sdk/client-rds";
import { IAMClient } from "@aws-sdk/client-iam";

interface UserAWSClients {
  ec2: EC2Client;
  s3: S3Client;
  rds: RDSClient;
  iam: IAMClient;
}

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

  const rootMFAResult =
    await checkRootAccountMFA();

  const iamAccessKeyFindings =
    await scanIAMAccessKeys();

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

  findings.push(
    ...ec2SecurityGroupFindings
  );

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
        title:
          "S3 Bucket Public Access Not Fully Blocked",
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

    const encryptionResult =
      await checkS3Encryption(bucket.name);

    if (!encryptionResult.passed) {
      findings.push({
        id: `s3-encryption-${bucket.name}`,
        title:
          "S3 Bucket Does Not Have Default Encryption",
        severity: "HIGH",
        resourceId: `s3-${bucket.name}`,
        resourceType: "S3",
        region: bucket.region,
        status: "OPEN",
        category: "Data Protection",
        description: `S3 bucket ${bucket.name} does not have server-side encryption configured.`,
      });
    }

    // S3 Versioning

    const versioningResult =
      await checkS3Versioning(bucket.name);

    if (!versioningResult.passed) {
      findings.push({
        id: `s3-versioning-${bucket.name}`,
        title:
          "S3 Bucket Versioning Is Disabled",
        severity: "MEDIUM",
        resourceId: `s3-${bucket.name}`,
        resourceType: "S3",
        region: bucket.region,
        status: "OPEN",
        category: "Data Protection",
        description: `S3 bucket ${bucket.name} does not have versioning enabled.`,
      });
    }

    // S3 Server Access Logging

    const loggingResult =
      await checkS3Logging(bucket.name);

    if (!loggingResult.passed) {
      findings.push({
        id: `s3-logging-${bucket.name}`,
        title:
          "S3 Server Access Logging Is Disabled",
        severity: "MEDIUM",
        resourceId: `s3-${bucket.name}`,
        resourceType: "S3",
        region: bucket.region,
        status: "OPEN",
        category: "Monitoring & Audit",
        description: `S3 bucket ${bucket.name} does not have server access logging enabled.`,
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
        title:
          "RDS Instance Is Publicly Accessible",
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
        title:
          "RDS Instance Storage Is Not Encrypted",
        severity: "HIGH",
        resourceId: db.id,
        resourceType: "RDS",
        region: db.region,
        status: "OPEN",
        category: "Data Protection",
        description: `RDS database ${db.id} does not have storage encryption enabled.`,
      });
    }

    if (db.backupRetentionPeriod === 0) {
      findings.push({
        id: `rds-no-backup-${db.id}`,
        title:
          "RDS Automated Backups Are Disabled",
        severity: "HIGH",
        resourceId: db.id,
        resourceType: "RDS",
        region: db.region,
        status: "OPEN",
        category: "Data Protection",
        description: `RDS database ${db.id} has automated backups disabled.`,
      });
    }
  }

  // -------------------------
  // IAM Security Checks
  // -------------------------

  if (!rootMFAResult.passed) {
    findings.push({
      id: "iam-root-mfa-disabled",
      title:
        "AWS Root Account MFA Is Disabled",
      severity: "CRITICAL",
      resourceId: "aws-account",
      resourceType: "IAM",
      region:
        process.env.AWS_REGION || "global",
      status: "OPEN",
      category: "Identity & Access",
      description:
        "The AWS root account does not have multi-factor authentication enabled.",
    });
  }

  findings.push(
    ...iamAccessKeyFindings
  );

  return findings;
};



export const scanUserAWSSecurity = async (
  clients: UserAWSClients
) => {
  const [
    ec2Instances,
    s3Buckets,
    rdsInstances,
    ec2SecurityGroupFindings,
  ] = await Promise.all([
    getEC2Instances(clients.ec2),
    getS3Buckets(clients.s3),
    getRDSInstances(clients.rds),
    scanEC2SecurityGroups(clients.ec2),
  ]);

  const rootMFAResult =
    await checkRootAccountMFA(clients.iam);

  const iamAccessKeyFindings =
    await scanIAMAccessKeys(clients.iam);

  const findings = [];

  // EC2: public IPs
  for (const instance of ec2Instances) {
    if (!instance.id || !instance.publicIp) continue;

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

  findings.push(...ec2SecurityGroupFindings);

  // S3 security checks
  for (const bucket of s3Buckets) {
    if (!bucket.name) continue;

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

    const encryption = await checkS3Encryption(
      bucket.name,
      clients.s3
    );

    if (!encryption.passed) {
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

    const versioning = await checkS3Versioning(
      bucket.name,
      clients.s3
    );

    if (!versioning.passed) {
      findings.push({
        id: `s3-versioning-${bucket.name}`,
        title: "S3 Bucket Versioning Is Disabled",
        severity: "MEDIUM",
        resourceId: `s3-${bucket.name}`,
        resourceType: "S3",
        region: bucket.region,
        status: "OPEN",
        category: "Data Protection",
        description: `S3 bucket ${bucket.name} does not have versioning enabled.`,
      });
    }

    const logging = await checkS3Logging(
      bucket.name,
      clients.s3
    );

    if (!logging.passed) {
      findings.push({
        id: `s3-logging-${bucket.name}`,
        title: "S3 Server Access Logging Is Disabled",
        severity: "MEDIUM",
        resourceId: `s3-${bucket.name}`,
        resourceType: "S3",
        region: bucket.region,
        status: "OPEN",
        category: "Monitoring & Audit",
        description: `S3 bucket ${bucket.name} does not have server access logging enabled.`,
      });
    }
  }

  // RDS security checks
  for (const db of rdsInstances) {
    if (!db.id) continue;

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

    if (db.backupRetentionPeriod === 0) {
      findings.push({
        id: `rds-no-backup-${db.id}`,
        title: "RDS Automated Backups Are Disabled",
        severity: "HIGH",
        resourceId: db.id,
        resourceType: "RDS",
        region: db.region,
        status: "OPEN",
        category: "Data Protection",
        description: `RDS database ${db.id} has automated backups disabled.`,
      });
    }
  }

  // IAM security checks
  if (!rootMFAResult.passed) {
    findings.push({
      id: "iam-root-mfa-disabled",
      title: "AWS Root Account MFA Is Disabled",
      severity: "CRITICAL",
      resourceId: "aws-account",
      resourceType: "IAM",
      region: "global",
      status: "OPEN",
      category: "Identity & Access",
      description:
        "The AWS root account does not have multi-factor authentication enabled.",
    });
  }

  findings.push(...iamAccessKeyFindings);

  return findings;
};