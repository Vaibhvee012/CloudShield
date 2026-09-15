import { useEffect, useState } from "react";
import { getRemediationActions } from "../services/api";

interface RemediationAction {
  id: string;
  findingId: string;
  title: string;
  resource: string;
  action: string;
  status: string;
  riskReduction: string;
}

function Remediation() {
  const [actions, setActions] = useState<RemediationAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRemediationActions = async () => {
      try {
        const response = await getRemediationActions();
        setActions(response.data);
      } catch (error) {
        setError("Failed to load remediation actions");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchRemediationActions();
  }, []);

  if (loading) {
    return <h1>Loading Remediation...</h1>;
  }

  if (error) {
    return <h1>{error}</h1>;
  }

  return (
    <div>
      <h1>Remediation</h1>

      <p>Total Actions: {actions.length}</p>

      {actions.map((action) => (
        <div key={action.id}>
          <h2>{action.title}</h2>

          <p>Finding: {action.findingId}</p>
          <p>Resource: {action.resource}</p>
          <p>Action: {action.action}</p>
          <p>Status: {action.status}</p>
          <p>Risk Reduction: {action.riskReduction}</p>

          <hr />
        </div>
      ))}
    </div>
  );
}

export default Remediation;