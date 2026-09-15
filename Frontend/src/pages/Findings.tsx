import { useEffect, useState } from "react";
import { getFindings } from "../services/api";

interface Finding {
  id: string;
  title: string;
  severity: string;
  resource: string;
  resourceType: string;
  region: string;
  status: string;
  category: string;
  description: string;
}

function Findings() {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFindings = async () => {
      try {
        const response = await getFindings();
        setFindings(response.data);
      } catch (error) {
        setError("Failed to load findings");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchFindings();
  }, []);

  if (loading) {
    return <h1>Loading Findings...</h1>;
  }

  if (error) {
    return <h1>{error}</h1>;
  }

  return (
    <div>
      <h1>Security Findings</h1>

      <p>Total Findings: {findings.length}</p>

      {findings.map((finding) => (
        <div key={finding.id}>
          <h2>{finding.title}</h2>

          <p>Severity: {finding.severity}</p>
          <p>Resource: {finding.resource}</p>
          <p>Resource Type: {finding.resourceType}</p>
          <p>Region: {finding.region}</p>
          <p>Status: {finding.status}</p>
          <p>Category: {finding.category}</p>
          <p>Description: {finding.description}</p>

          <hr />
        </div>
      ))}
    </div>
  );
}

export default Findings;