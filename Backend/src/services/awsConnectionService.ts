import {
  AssumeRoleCommand,
  GetCallerIdentityCommand,
  STSClient,
} from "@aws-sdk/client-sts";

interface AWSConnectionInput {
  roleArn: string;
  region: string;
}

export const assumeAWSRole = async ({
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

  const assumedRoleSTSClient = new STSClient({
    region,
    credentials: {
      accessKeyId: credentials.AccessKeyId,
      secretAccessKey: credentials.SecretAccessKey,
      sessionToken: credentials.SessionToken,
    },
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