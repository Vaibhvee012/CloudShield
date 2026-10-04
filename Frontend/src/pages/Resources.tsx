import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Cloud,
  Database,
  Globe,
  Server,
} from "lucide-react";

import CloudMap from "../components/CloudMap";
import { getResources } from "../services/api";

interface Resource {
  id: string;
  name: string;
  type: string;
  region: string;
  status: string;
  environment: string;
  riskLevel: string;
  source: string;
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
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#8B5CF6] border-t-transparent" />

          <p className="mt-4 text-sm text-gray-500">
            Loading AWS resources...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-[#EF4444]/20 bg-[#0B0914] p-6">
        <div className="flex items-center gap-3">
          <AlertTriangle
            className="shrink-0 text-[#EF4444]"
            size={20}
          />

          <div className="min-w-0">
            <h2 className="font-semibold text-white">
              Unable to load resources
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const healthyResources = resources.filter((resource) => {
    const status = resource.status?.toLowerCase();

    return (
      status === "healthy" ||
      status === "active" ||
      status === "running"
    );
  }).length;

  return (
    <div className="w-full min-w-0 space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#8B5CF6]/10">
              <Cloud
                size={21}
                className="text-[#A78BFA]"
              />
            </div>

            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                AWS Resources
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Monitor your cloud infrastructure and resource health
              </p>
            </div>
          </div>
        </div>

        <div className="w-full shrink-0 rounded-xl border border-white/10 bg-[#0B0914] px-4 py-3 sm:w-auto">
          <p className="text-xs text-gray-500">
            Total Resources
          </p>

          <p className="mt-1 text-xl font-bold text-white">
            {resources.length}
          </p>
        </div>
      </div>

      {/* Cloud Map */}
      <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0B0914] p-4 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="font-semibold text-white">
              Cloud Infrastructure Map
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Visual representation of your AWS infrastructure
            </p>
          </div>

          <Globe
            size={20}
            className="shrink-0 text-[#A78BFA]"
          />
        </div>

<div className="mt-4 w-full overflow-x-auto">
  <CloudMap resources={resources} />
</div>
      </div>

      {/* Resource Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={<Server size={19} />}
          label="EC2"
          count={getResourceCount(resources, "EC2")}
        />

        <SummaryCard
          icon={<Database size={19} />}
          label="RDS"
          count={getResourceCount(resources, "RDS")}
        />

        <SummaryCard
          icon={<Cloud size={19} />}
          label="S3"
          count={getResourceCount(resources, "S3")}
        />

        <SummaryCard
          icon={<CheckCircle2 size={19} />}
          label="Healthy"
          count={healthyResources}
        />
      </div>

      {/* Resource Inventory */}
      <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0B0914]">
        <div className="border-b border-white/10 px-4 py-5 sm:px-6">
          <h2 className="font-semibold text-white">
            Resource Inventory
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Resources discovered in your connected environment
          </p>
        </div>

        {resources.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Cloud
              size={32}
              className="mx-auto text-gray-600"
            />

            <p className="mt-3 text-sm text-gray-400">
              No AWS resources found
            </p>

            <p className="mt-1 text-xs text-gray-600">
              Connect an AWS account to begin resource discovery.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {resources.map((resource) => (
              <ResourceRow
                key={resource.id}
                resource={resource}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* Summary Card */
function SummaryCard({
  icon,
  label,
  count,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-[#0B0914] p-5 transition hover:border-[#8B5CF6]/30">
      <div className="flex items-center justify-between gap-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#8B5CF6]/10 text-[#A78BFA]">
          {icon}
        </div>

        <span className="min-w-0 text-2xl font-bold text-white">
          {count}
        </span>
      </div>

      <p className="mt-4 text-xs font-medium uppercase tracking-wider text-gray-500">
        {label}
      </p>
    </div>
  );
}

/* Resource Row */
function ResourceRow({
  resource,
}: {
  resource: Resource;
}) {
  const risk = resource.riskLevel?.toLowerCase() || "low";

  const riskClass =
    risk === "critical"
      ? "bg-[#EF4444]/10 text-[#EF4444]"
      : risk === "high"
        ? "bg-[#F59E0B]/10 text-[#F59E0B]"
        : risk === "medium"
          ? "bg-yellow-500/10 text-yellow-400"
          : "bg-[#22C55E]/10 text-[#22C55E]";

  const ResourceIcon =
    resource.type?.toLowerCase() === "ec2"
      ? Server
      : resource.type?.toLowerCase() === "rds"
        ? Database
        : Cloud;

  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 px-4 py-5 transition hover:bg-white/[0.02] sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,auto)] lg:items-center">
      {/* Resource Identity */}
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#8B5CF6]/10 text-[#A78BFA]">
          <ResourceIcon size={19} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="break-words text-sm font-medium leading-5 text-white">
            {resource.name}
          </p>

          <p className="mt-1 break-words text-xs leading-5 text-gray-600">
            {resource.type} · {resource.region}
          </p>
        </div>
      </div>

      {/* Resource Metadata */}
      <div className="flex min-w-0 flex-wrap items-center gap-2 lg:justify-end">
        <ResourceBadge value={resource.environment} />

        <ResourceBadge value={resource.status} />

        <ResourceBadge value={resource.source} />

        <span
          className={`max-w-full rounded-lg px-2.5 py-1 text-[10px] font-semibold uppercase leading-4 ${riskClass}`}
        >
          {resource.riskLevel}
        </span>
      </div>
    </div>
  );
}

function ResourceBadge({
  value,
}: {
  value: string;
}) {
  return (
    <span className="max-w-full break-words rounded-lg bg-white/5 px-2.5 py-1 text-[10px] font-medium uppercase leading-4 text-gray-400">
      {value}
    </span>
  );
}

function getResourceCount(
  resources: Resource[],
  type: string
) {
  return resources.filter(
    (resource) =>
      resource.type?.toLowerCase() === type.toLowerCase()
  ).length;
}

export default Resources;
