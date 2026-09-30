import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ShieldAlert,
} from "lucide-react";

import { getFindings } from "../services/api";

interface FindingResource {
  id: string;
  name: string;
  type: string;
  region: string;
  status: string;
  environment: string;
  riskLevel: string;
  source: string;
}

interface Finding {
  id: string;
  title: string;
  severity: string;
  resourceId: string;
  resourceType: string;
  region: string;
  status: string;
  category: string;
  description: string;
  resource: FindingResource;
  createdAt: string;
  updatedAt: string;
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
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#8B5CF6] border-t-transparent" />

          <p className="mt-4 text-sm text-gray-500">
            Loading security findings...
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
            size={20}
            className="text-[#EF4444]"
          />

          <div>
            <h2 className="font-semibold text-white">
              Unable to load findings
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const criticalCount = findings.filter(
    (finding) =>
      finding.severity?.toLowerCase() === "critical"
  ).length;

  const highCount = findings.filter(
    (finding) =>
      finding.severity?.toLowerCase() === "high"
  ).length;

  const openCount = findings.filter(
    (finding) =>
      finding.status?.toLowerCase() === "open"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EF4444]/10">
              <ShieldAlert
                size={21}
                className="text-[#EF4444]"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Security Findings
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Identify and investigate security risks across your cloud
                environment
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0B0914] px-4 py-3">
          <p className="text-xs text-gray-500">
            Total Findings
          </p>

          <p className="mt-1 text-xl font-bold text-white">
            {findings.length}
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FindingSummary
          icon={<ShieldAlert size={19} />}
          label="Total Findings"
          count={findings.length}
          iconClass="bg-[#8B5CF6]/10 text-[#A78BFA]"
        />

        <FindingSummary
          icon={<AlertTriangle size={19} />}
          label="Critical"
          count={criticalCount}
          iconClass="bg-[#EF4444]/10 text-[#EF4444]"
        />

        <FindingSummary
          icon={<AlertTriangle size={19} />}
          label="High"
          count={highCount}
          iconClass="bg-[#F59E0B]/10 text-[#F59E0B]"
        />

        <FindingSummary
          icon={<Clock3 size={19} />}
          label="Open"
          count={openCount}
          iconClass="bg-[#C084FC]/10 text-[#C084FC]"
        />
      </div>

      {/* Findings */}
      <div className="rounded-2xl border border-white/10 bg-[#0B0914]">
        <div className="border-b border-white/10 px-6 py-5">
          <h2 className="font-semibold text-white">
            Findings Inventory
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Security issues discovered across your connected resources
          </p>
        </div>

        {findings.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <CheckCircle2
              size={34}
              className="mx-auto text-[#22C55E]"
            />

            <p className="mt-3 text-sm font-medium text-gray-300">
              No security findings
            </p>

            <p className="mt-1 text-xs text-gray-600">
              Your connected environment currently has no detected findings.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {findings.map((finding) => (
              <FindingRow
                key={finding.id}
                finding={finding}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FindingSummary({
  icon,
  label,
  count,
  iconClass,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0B0914] p-5 transition hover:border-[#8B5CF6]/30">
      <div className="flex items-center justify-between">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconClass}`}
        >
          {icon}
        </div>

        <span className="text-2xl font-bold text-white">
          {count}
        </span>
      </div>

      <p className="mt-4 text-xs font-medium uppercase tracking-wider text-gray-500">
        {label}
      </p>
    </div>
  );
}

function FindingRow({
  finding,
}: {
  finding: Finding;
}) {
  const severity = finding.severity?.toLowerCase() || "low";

  const severityClass =
    severity === "critical"
      ? "bg-[#EF4444]/10 text-[#EF4444]"
      : severity === "high"
        ? "bg-[#F59E0B]/10 text-[#F59E0B]"
        : severity === "medium"
          ? "bg-yellow-500/10 text-yellow-400"
          : "bg-[#22C55E]/10 text-[#22C55E]";

  const status = finding.status?.toLowerCase() || "unknown";

  const statusClass =
    status === "open"
      ? "bg-[#EF4444]/10 text-[#EF4444]"
      : status === "resolved" || status === "closed"
        ? "bg-[#22C55E]/10 text-[#22C55E]"
        : "bg-white/5 text-gray-400";

  return (
    <div className="px-6 py-5 transition hover:bg-white/[0.02]">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        {/* Finding information */}
        <div className="flex min-w-0 gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#8B5CF6]/10">
            <ShieldAlert
              size={19}
              className="text-[#A78BFA]"
            />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-white">
                {finding.title}
              </h3>

              <span
                className={`rounded-lg px-2.5 py-1 text-[10px] font-semibold uppercase ${severityClass}`}
              >
                {finding.severity}
              </span>
            </div>

            <p className="mt-2 max-w-3xl text-xs leading-5 text-gray-500">
              {finding.description}
            </p>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-gray-600">
              <span>
                Resource:{" "}
                <span className="text-gray-400">
                  {finding.resource?.name || finding.resourceId}
                </span>
              </span>

              <span>
                Type:{" "}
                <span className="text-gray-400">
                  {finding.resourceType}
                </span>
              </span>

              <span>
                Region:{" "}
                <span className="text-gray-400">
                  {finding.region}
                </span>
              </span>

              <span>
                Category:{" "}
                <span className="text-gray-400">
                  {finding.category}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="shrink-0 lg:pt-1">
          <span
            className={`rounded-lg px-2.5 py-1 text-[10px] font-semibold uppercase ${statusClass}`}
          >
            {finding.status}
          </span>
        </div>
      </div>
    </div>
  );
}

export default Findings;