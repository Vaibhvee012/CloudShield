import {
  IAMClient,
  GetAccountSummaryCommand,
  ListUsersCommand,
  ListAccessKeysCommand,
} from "@aws-sdk/client-iam";

const iamClient = new IAMClient({
  region: process.env.AWS_REGION || "ap-south-1",
});

export const checkRootAccountMFA = async () => {
  const command = new GetAccountSummaryCommand({});

  const response = await iamClient.send(command);

  const summary = response.SummaryMap || {};

  const rootMFAEnabled =
    summary.AccountMFAEnabled === 1;

  return {
    check: "IAM Root Account MFA",
    passed: rootMFAEnabled,
    severity: rootMFAEnabled ? "LOW" : "CRITICAL",
    message: rootMFAEnabled
      ? "Root account MFA is enabled."
      : "Root account MFA is not enabled.",
  };
};

export const scanIAMAccessKeys = async () => {
  const usersResponse = await iamClient.send(
    new ListUsersCommand({})
  );

  const users = usersResponse.Users || [];

  const findings = [];

  const now = Date.now();
  const ninetyDays =
    90 * 24 * 60 * 60 * 1000;

  for (const user of users) {
    if (!user.UserName) {
      continue;
    }

    const response = await iamClient.send(
      new ListAccessKeysCommand({
        UserName: user.UserName,
      })
    );

    for (const accessKey of response.AccessKeyMetadata || []) {
      if (
        !accessKey.AccessKeyId ||
        !accessKey.CreateDate
      ) {
        continue;
      }

      const age =
        now - accessKey.CreateDate.getTime();

      if (
        age > ninetyDays &&
        accessKey.Status === "Active"
      ) {
        findings.push({
          id: `iam-old-access-key-${user.UserName}-${accessKey.AccessKeyId}`,
          title: "IAM Access Key Is Older Than 90 Days",
          severity: "HIGH",
          resourceId: "aws-account",
          resourceType: "IAM",
          region: "global",
          status: "OPEN",
          category: "Identity & Access",
          description: `IAM user ${user.UserName} has an active access key older than 90 days.`,
        });
      }
    }
  }

  return findings;
};