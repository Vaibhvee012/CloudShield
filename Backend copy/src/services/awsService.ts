import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";

const stsClient = new STSClient({
  region: process.env.AWS_REGION || "ap-south-1",
});

export const getAWSAccountIdentity = async () => {
  const command = new GetCallerIdentityCommand({});

  const response = await stsClient.send(command);

  return {
    accountId: response.Account,
    userId: response.UserId,
    arn: response.Arn,
  };
};