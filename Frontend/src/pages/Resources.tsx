import { useEffect, useState } from "react";
import { getResources } from "../services/api";

interface Resource {
  id: string;
  name: string;
  type: string;
  region: string;
  status: string;
  environment: string;
  riskLevel: string;
}

function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await getResources();
        setResources(response.data);
      } catch (error) {
        setError("Failed to load resources");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  if (loading) {
    return <h1>Loading Resources...</h1>;
  }

  if (error) {
    return <h1>{error}</h1>;
  }

  return (
    <div>
      <h1>AWS Resources</h1>

      <p>Total Resources: {resources.length}</p>

      {resources.map((resource) => (
        <div key={resource.id}>
          <h2>{resource.name}</h2>

          <p>Type: {resource.type}</p>
          <p>Region: {resource.region}</p>
          <p>Status: {resource.status}</p>
          <p>Environment: {resource.environment}</p>
          <p>Risk Level: {resource.riskLevel}</p>

          <hr />
        </div>
      ))}
    </div>
  );
}

export default Resources;