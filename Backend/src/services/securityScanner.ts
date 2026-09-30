import { getEC2Instances } from "./ec2Service";
import { getS3Buckets } from "./s3Service";
import { getRDSInstances } from "./rdsService";

export const scanAWSSecurity = async () => {
  const [ec2Instances, s3Buckets, rdsInstances] = await Promise.all([
    getEC2Instances(),
    getS3Buckets(),
    getRDSInstances(),
  ]);

  const findings = [];

  // -------------------------
  // EC2 Security Checks
  // -------------------------

  for (const instance of ec2Instances) {
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
  // S3 Security Checks
  // -------------------------

  for (const bucket of s3Buckets) {
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
  }

  // -------------------------
  // RDS Security Checks
  // -------------------------

  for (const db of rdsInstances) {
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
  }

  return findings;
};