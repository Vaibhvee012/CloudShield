const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const TOKEN_KEY = "cloudshield_token";
export const USER_KEY = "cloudshield_user";

// API responses are plain JSON. Typed responses can come later.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ApiResponse = any;

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const SESSION_NOTICE_KEY = "cloudshield_notice";

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// Wrapped in an object so tests can see a redirect without a page navigation.
export const navigation = {
  toLogin: () => window.location.assign("/login"),
};

// Full page navigation on purpose: it also drops any data held in memory.
export const signOut = () => {
  clearSession();
  navigation.toLogin();
};

const handleUnauthorized = () => {
  clearSession();

  if (window.location.pathname !== "/login") {
    sessionStorage.setItem(
      SESSION_NOTICE_KEY,
      "Your session expired. Please sign in again."
    );
    navigation.toLogin();
  }
};

async function request(
  path: string,
  fallbackMessage: string,
  init: { method?: string; body?: unknown } = {}
): Promise<ApiResponse> {
  const token = localStorage.getItem(TOKEN_KEY);

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: init.method ?? "GET",
      headers: {
        ...(init.body !== undefined
          ? { "Content-Type": "application/json" }
          : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body:
        init.body !== undefined ? JSON.stringify(init.body) : undefined,
    });
  } catch {
    throw new ApiError(
      0,
      "Unable to reach the CloudShield server. Check your connection and try again."
    );
  }

  const isJson = (response.headers.get("content-type") || "").includes(
    "application/json"
  );

  const data = isJson ? await response.json().catch(() => null) : null;

  if (response.status === 401) {
    handleUnauthorized();
    throw new ApiError(
      401,
      "Your session has expired. Please sign in again."
    );
  }

  if (!response.ok) {
    throw new ApiError(response.status, data?.message || fallbackMessage);
  }

  return data;
}

// ===============================
// Security, resources, findings, remediation
// ===============================

export const getSecurityPosture = () =>
  request("/security", "Failed to fetch security posture");

export const getResources = () =>
  request("/resources", "Failed to fetch resources");

export const getFindings = () =>
  request("/findings", "Failed to fetch findings");

export const getRemediationActions = () =>
  request("/remediation", "Failed to fetch remediation actions");

// ===============================
// AWS
// ===============================

export const fullAWSSync = () =>
  request("/aws/full-sync", "Failed to sync AWS resources", {
    method: "POST",
  });

export const getAWSSyncStatus = () =>
  request("/aws/sync-status", "Failed to fetch AWS sync status");

export const getAWSResources = () =>
  request("/aws/resources", "Failed to fetch AWS resources");

export const connectAWS = (connection: {
  accountId: string;
  roleArn: string;
  region: string;
}) =>
  request("/aws/connect", "Failed to connect AWS account", {
    method: "POST",
    body: connection,
  });

export const getAWSConnections = () =>
  request("/aws/connections", "Failed to fetch AWS connections");

// ===============================
// AI
// ===============================

export const getDashboardAIInsight = (refresh = false) =>
  request(
    `/ai/dashboard/insight${refresh ? "?refresh=1" : ""}`,
    "Failed to fetch dashboard AI insight"
  );

export const chatWithAI = (question: string) =>
  request("/ai/chat", "Failed to get an AI response", {
    method: "POST",
    body: { question },
  });

// ===============================
// Audit log
// ===============================

export const getAuditLogs = (
  limit = 25,
  filters: { cursor?: string; action?: string; outcome?: string } = {}
) => {
  const params = new URLSearchParams({ limit: String(limit) });

  if (filters.cursor) params.set("cursor", filters.cursor);
  if (filters.action) params.set("action", filters.action);
  if (filters.outcome) params.set("outcome", filters.outcome);

  return request(
    `/audit-logs?${params.toString()}`,
    "Failed to fetch audit logs"
  );
};
