import {
  AssumeRoleCommand,
  GetCallerIdentityCommand,
  STSClient,
} from "@aws-sdk/client-sts";
import { EC2Client } from "@aws-sdk/client-ec2";
import { S3Client } from "@aws-sdk/client-s3";
import { RDSClient } from "@aws-sdk/client-rds";
import { IAMClient } from "@aws-sdk/client-iam";

interface AWSConnectionInput {
  roleArn: string;
  region: string;
}

const getTemporaryCredentials = async ({
  roleArn,
  region,
}: AWSConnectionInput) => {
  const stsClient = new STSClient({
    region,
  });

  const assumeRoleCommand = new AssumeRoleCommand({
    RoleArn: roleArn,
    RoleSessionName: `cloudshield-${Date.now()}`,
    DurationSeconds: 900,
  });

  const assumeRoleResponse = await stsClient.send(assumeRoleCommand);

  const credentials = assumeRoleResponse.Credentials;

  if (
    !credentials?.AccessKeyId ||
    !credentials.SecretAccessKey ||
    !credentials.SessionToken
  ) {
    throw new Error("AWS STS did not return temporary credentials");
  }

  return {
    accessKeyId: credentials.AccessKeyId,
    secretAccessKey: credentials.SecretAccessKey,
    sessionToken: credentials.SessionToken,
  };
};

export const assumeAWSRole = async ({
  roleArn,
  region,
}: AWSConnectionInput) => {
  const credentials = await getTemporaryCredentials({
    roleArn,
    region,
  });

  const assumedRoleSTSClient = new STSClient({
    region,
    credentials,
  });

  const identityResponse = await assumedRoleSTSClient.send(
    new GetCallerIdentityCommand({})
  );

  return {
    accountId: identityResponse.Account,
    userId: identityResponse.UserId,
    arn: identityResponse.Arn,
  };
};

export const getAWSClientsFromConnection = async ({
  roleArn,
  region,
}: AWSConnectionInput) => {
  const credentials = await getTemporaryCredentials({
    roleArn,
    region,
  });

  return {
    ec2: new EC2Client({
      region,
      credentials,
    }),

    s3: new S3Client({
      region,
      credentials,
    }),

    rds: new RDSClient({
      region,
      credentials,
    }),

    iam: new IAMClient({
      region,
      credentials,
    }),
  };
};