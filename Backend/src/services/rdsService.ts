import {
  RDSClient,
  DescribeDBInstancesCommand,
} from "@aws-sdk/client-rds";

const rdsClient = new RDSClient({
  region: process.env.AWS_REGION || "ap-south-1",
});

const AWS_REGION =
  process.env.AWS_REGION || "ap-south-1";

export const getRDSInstances = async () => {
  const command = new DescribeDBInstancesCommand({});

  const response = await rdsClient.send(command);

  return (
    response.DBInstances?.map((db) => ({
      id: db.DBInstanceIdentifier,
      engine: db.Engine,
      engineVersion: db.EngineVersion,
      status: db.DBInstanceStatus,
      instanceClass: db.DBInstanceClass,
      region: AWS_REGION,
      endpoint: db.Endpoint?.Address,
      port: db.Endpoint?.Port,

      publiclyAccessible:
        db.PubliclyAccessible ?? false,

      storageEncrypted:
        db.StorageEncrypted ?? false,

      backupRetentionPeriod:
        db.BackupRetentionPeriod ?? 0,
    })) || []
  );
};