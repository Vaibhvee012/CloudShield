import { useEffect, useState } from "react";
import { getSecurityPosture } from "../services/api";

interface SecurityData {
  securityScore: number;
  totalFindings: number;
  severity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  resources: {
    total: number;
    healthy: number;
    healthPercentage: number;
  };
}

function Dashboard() {
  const [securityData, setSecurityData] = useState<SecurityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSecurityData = async () => {
      try {
        const response = await getSecurityPosture();
        setSecurityData(response.data);
      } catch (error) {
        setError("Failed to load security data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSecurityData();
  }, []);

  if (loading) {
    return <h1>Loading Dashboard...</h1>;
  }

  if (error) {
    return <h1>{error}</h1>;
  }

  return (
    <div>
      <h1>CloudShield Dashboard</h1>

      {securityData && (
        <div>
          <h2>Security Score: {securityData.securityScore}</h2>

          <h3>Total Findings: {securityData.totalFindings}</h3>

          <h3>Severity</h3>
          <p>Critical: {securityData.severity.critical}</p>
          <p>High: {securityData.severity.high}</p>
          <p>Medium: {securityData.severity.medium}</p>
          <p>Low: {securityData.severity.low}</p>

          <h3>Resources</h3>
          <p>Total: {securityData.resources.total}</p>
          <p>Healthy: {securityData.resources.healthy}</p>
          <p>
            Health: {securityData.resources.healthPercentage}%
          </p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;