import prisma from "../lib/prisma";
import { DescribeInstancesCommand } from "@aws-sdk/client-ec2";
import { ListBucketsCommand } from "@aws-sdk/client-s3";
import { DescribeDBInstancesCommand } from "@aws-sdk/client-rds";
import { ListUsersCommand } from "@aws-sdk/client-iam";
import { getAWSClientsFromConnection } from "./awsConnectionService";

export const discoverUserAWSResources = async (
  connectionId: string
) => {
  const connection = await prisma.aWSConnection.findUnique({
    where: {
      id: connectionId,
    },
  });

  if (!connection) {
    throw new Error("AWS connection not found");
  }

  const clients = await getAWSClientsFromConnection({
    roleArn: connection.roleArn,
    region: connection.region,
  });

  const resources = [];

  /*
   * EC2 resource discovery
   */
  const ec2Response = await clients.ec2.send(
    new DescribeInstancesCommand({})
  );

  const instances =
    ec2Response.Reservations?.flatMap(
      (reservation) => reservation.Instances || []
    ) || [];

  for (const instance of instances) {
    if (!instance.InstanceId) {
      continue;
    }

    resources.push({
      resourceId: instance.InstanceId,
      resourceType: "EC2",
      name:
        instance.Tags?.find(
          (tag) => tag.Key === "Name"
        )?.Value || "Unnamed Instance",
      region: connection.region,
    });
  }

  /*
   * S3 resource discovery
   */
  const s3Response = await clients.s3.send(
    new ListBucketsCommand({})
  );

  for (const bucket of s3Response.Buckets || []) {
    if (!bucket.Name) {
      continue;
    }

    resources.push({
      resourceId: bucket.Name,
      resourceType: "S3",
      name: bucket.Name,
      region: connection.region,
    });
  }

  /*
   * RDS resource discovery
   */
  const rdsResponse = await clients.rds.send(
    new DescribeDBInstancesCommand({})
  );

  for (const database of rdsResponse.DBInstances || []) {
    if (!database.DBInstanceIdentifier) {
      continue;
    }

    resources.push({
      resourceId: database.DBInstanceIdentifier,
      resourceType: "RDS",
      name: database.DBInstanceIdentifier,
      region: connection.region,
    });
  }

  /*
   * IAM resource discovery
   */
  const iamResponse = await clients.iam.send(
    new ListUsersCommand({})
  );

  for (const user of iamResponse.Users || []) {
    if (!user.UserName) {
      continue;
    }

    resources.push({
      resourceId: user.UserName,
      resourceType: "IAM",
      name: user.UserName,
      region: "global",
    });
  }

  return resources;
};