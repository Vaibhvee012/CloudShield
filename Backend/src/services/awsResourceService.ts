import { getEC2Instances } from "./ec2Service";
import { getS3Buckets } from "./s3Service";
import { getRDSInstances } from "./rdsService";

export const discoverAWSResources = async () => {
  const [ec2Instances, s3Buckets, rdsInstances] = await Promise.all([
    getEC2Instances(),
    getS3Buckets(),
    getRDSInstances(),
  ]);

  const resources = [
    {
  id: "aws-account",
  name: "AWS Account",
  type: "IAM",
  region: "global",
  status: "active",
  environment: "production",
  riskLevel: "low",
},
    ...ec2Instances.map((instance) => ({
      id: instance.id!,
      name: instance.name,
      type: "EC2",
      region: instance.region,
      status: instance.state || "unknown",
      environment: "unknown",
      riskLevel: "low",
    })),

    ...s3Buckets.map((bucket) => ({
      id: `s3-${bucket.name}`,
      name: bucket.name!,
      type: "S3",
      region: bucket.region,
      status: "available",
      environment: "unknown",
      riskLevel: "low",
    })),

    ...rdsInstances.map((db) => ({
      id: db.id!,
      name: db.id!,
      type: "RDS",
      region: db.region,
      status: db.status || "unknown",
      environment: "unknown",
      riskLevel: "low",
    })),
  ];

  return resources;
};