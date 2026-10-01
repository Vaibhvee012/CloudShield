import {
  IAMClient,
  GetAccountSummaryCommand,
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