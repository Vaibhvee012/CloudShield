// Ownership is resolved through AWSConnection.userId.
// Rows with no awsConnection have no owner and never match.

export const ownedResources = (userId: string) => ({
  awsConnection: { userId },
});

export const ownedFindings = (userId: string) => ({
  awsConnection: { userId },
});

export const ownedRemediations = (userId: string) => ({
  finding: { awsConnection: { userId } },
});