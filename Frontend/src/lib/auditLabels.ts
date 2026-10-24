export const AUDIT_LABELS: Record<string, string> = {
  AUTH_LOGIN: "Sign-in",
  AUTH_REGISTER: "Account created",
  AWS_CONNECT: "AWS account connected",
  AWS_SYNC: "AWS scan",
  AWS_DISCONNECT: "AWS account disconnected",
  AI_CHAT: "AI assistant question",
  AI_EXPLAIN_FINDING: "AI finding explanation",
  AI_PRIORITIZE_RISKS: "AI risk prioritization",
  AI_SUGGEST_REMEDIATION: "AI remediation suggestion",
  AI_DASHBOARD_INSIGHT: "AI dashboard insight",
  ACCESS_DENIED: "Access denied",
};

export const auditLabel = (action: string) => AUDIT_LABELS[action] ?? action;

export const AUDIT_ACTION_OPTIONS = Object.entries(AUDIT_LABELS).map(
  ([value, label]) => ({ value, label })
);

const REASON_LABELS: Record<string, string> = {
  bad_password: "Wrong password",
  unknown_email: "Unknown email address",
  email_already_registered: "Email already registered",
  not_found_or_not_owned: "Not found, or not yours",
  validation_failed: "Invalid details",
  account_id_mismatch: "Account ID did not match the role",
  no_account_identity: "AWS returned no account identity",
  aws_connection_failed: "Could not connect to AWS",
  server_error: "Server error",
};

export const reasonLabel = (reason: string) =>
  REASON_LABELS[reason] ?? reason;