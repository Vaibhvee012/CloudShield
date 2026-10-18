# Advisory-only design

CloudShield reads AWS configuration and gives recommendations. It does not change AWS resources.

- The backend uses only read-only AWS API calls (List, Describe, Get) plus STS AssumeRole.
- No API endpoint executes a remediation or updates a remediation's status.
- AI endpoints return suggestions with `advisory: true`.

## Recommended IAM role policy
Attach a read-only policy to the role users create for CloudShield, for example the
AWS managed `SecurityAudit` policy. Verify it covers every call listed above. Even if
CloudShield had a bug, a read-only role could not modify the customer's account.