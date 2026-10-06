const API_BASE_URL =import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("cloudshield_token");

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

const handleResponse = async (response, fallbackMessage) => {
  const contentType = response.headers.get("content-type") || "";

  let data = null;

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    await response.text();
  }

  if (!response.ok) {
    throw new Error(
      data?.message || fallbackMessage
    );
  }

  return data;
};

export const getSecurityPosture = async () => {
  const response = await fetch(`${API_BASE_URL}/security`, {
    headers: getAuthHeaders(),
  });

  return handleResponse(
    response,
    "Failed to fetch security posture"
  );
};

export const getResources = async () => {
  const response = await fetch(`${API_BASE_URL}/resources`, {
    headers: getAuthHeaders(),
  });

  return handleResponse(
    response,
    "Failed to fetch resources"
  );
};

export const getFindings = async () => {
  const response = await fetch(`${API_BASE_URL}/findings`, {
    headers: getAuthHeaders(),
  });

  return handleResponse(
    response,
    "Failed to fetch findings"
  );
};

export const getRemediationActions = async () => {
  const response = await fetch(`${API_BASE_URL}/remediation`, {
    headers: getAuthHeaders(),
  });

  return handleResponse(
    response,
    "Failed to fetch remediation actions"
  );
};

export const fullAWSSync = async () => {
  const response = await fetch(
    `${API_BASE_URL}/aws/full-sync`,
    {
      method: "POST",
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(
    response,
    "Failed to sync AWS resources and security findings"
  );
};

export const getAWSSyncStatus = async () => {
  const response = await fetch(
    `${API_BASE_URL}/aws/sync-status`,
    {
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(
    response,
    "Failed to fetch AWS sync status"
  );
};

export const getAWSResources = async () => {
  const response = await fetch(
    `${API_BASE_URL}/aws/resources`,
    {
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(
    response,
    "Failed to fetch AWS resources"
  );
};

// ===============================
// Dashboard AI Insight
// ===============================

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

  return handleResponse(
    response,
    "Failed to fetch dashboard AI insight"
  );
};