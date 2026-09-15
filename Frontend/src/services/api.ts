const API_BASE_URL = "http://localhost:5000/api";

export const getSecurityPosture = async () => {
  const response = await fetch(`${API_BASE_URL}/security`);

  if (!response.ok) {
    throw new Error("Failed to fetch security posture");
  }

  return response.json();
};

export const getResources = async () => {
  const response = await fetch(`${API_BASE_URL}/resources`);

  if (!response.ok) {
    throw new Error("Failed to fetch resources");
  }

  return response.json();
};

export const getFindings = async () => {
  const response = await fetch(`${API_BASE_URL}/findings`);

  if (!response.ok) {
    throw new Error("Failed to fetch findings");
  }

  return response.json();
};

export const getRemediationActions = async () => {
  const response = await fetch(`${API_BASE_URL}/remediation`);

  if (!response.ok) {
    throw new Error("Failed to fetch remediation actions");
  }

  return response.json();
};