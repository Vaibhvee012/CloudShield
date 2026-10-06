const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem("cloudshield_token");

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

// ===============================
// Security Posture
// ===============================

export const getSecurityPosture = async () => {
  const response = await fetch(`${API_BASE_URL}/security`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch security posture");
  }

  return response.json();
};

// ===============================
// Resources
// ===============================

export const getResources = async () => {
  const response = await fetch(`${API_BASE_URL}/resources`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch resources");
  }

  return response.json();
};

// ===============================
// Findings
// ===============================

export const getFindings = async () => {
  const response = await fetch(`${API_BASE_URL}/findings`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch findings");
  }

  return response.json();
};

// ===============================
// Remediation
// ===============================

export const getRemediationActions = async () => {
  const response = await fetch(`${API_BASE_URL}/remediation`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch remediation actions");
  }

  return response.json();
};

// ===============================
// AWS Full Sync
// ===============================

export const fullAWSSync = async () => {
  const response = await fetch(`${API_BASE_URL}/aws/full-sync`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to sync AWS resources and security findings");
  }

  return response.json();
};

// ===============================
// AWS Sync Status
// ===============================

export const getAWSSyncStatus = async () => {
  const response = await fetch(`${API_BASE_URL}/aws/sync-status`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch AWS sync status");
  }

  return response.json();
};

export const getAWSResources = async () => {
  const response = await fetch(`${API_BASE_URL}/aws/resources`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch AWS resources");
  }

  return response.json();
};

export const getDashboardAIInsight = async () => {
  const response = await fetch(
    `${API_BASE_URL}/ai/dashboard/insight`,
    {
      method: "GET",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard AI insight");
  }

  return response.json();
};
