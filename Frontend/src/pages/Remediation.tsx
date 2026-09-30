import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Shield,
  Wrench,
} from "lucide-react";

import { getRemediationActions } from "../services/api";

interface RemediationResource {
  id: string;
  name: string;
  type: string;
  region: string;
  status: string;
  environment: string;
  riskLevel: string;
  source: string;
}

interface RemediationFinding {
  id: string;
  title: string;
  severity: string;
  resourceId: string;
  resourceType: string;
  region: string;
  status: string;
  category: string;
  description: string;
  resource: RemediationResource;
}

interface RemediationAction {
  id: string;
  findingId: string;
  title: string;
  action: string;
  status: string;
  riskReduction: string;
  finding?: RemediationFinding;
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
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#8B5CF6] border-t-transparent" />

          <p className="mt-4 text-sm text-gray-500">
            Loading remediation actions...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-[#EF4444]/20 bg-[#0B0914] p-6">
        <div className="flex items-center gap-3">
          <AlertTriangle size={20} className="text-[#EF4444]" />

          <div>
            <h2 className="font-semibold text-white">
              Unable to load remediation actions
            </h2>

            <p className="mt-1 text-sm text-gray-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const completedCount = actions.filter((action) => {
    const status = action.status?.toLowerCase();

    return (
      status === "completed" ||
      status === "resolved" ||
      status === "success"
    );
  }).length;

  const pendingCount = actions.filter((action) => {
    const status = action.status?.toLowerCase();

    return (
      status === "pending" ||
      status === "open" ||
      status === "queued"
    );
  }).length;

  const inProgressCount = actions.filter((action) => {
    const status = action.status?.toLowerCase();

    return (
      status === "in progress" ||
      status === "in-progress" ||
      status === "running"
    );
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8B5CF6]/10">
              <Wrench size={21} className="text-[#A78BFA]" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Remediation
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Track actions taken to reduce security risks
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0B0914] px-4 py-3">
          <p className="text-xs text-gray-500">Total Actions</p>

          <p className="mt-1 text-xl font-bold text-white">
            {actions.length}
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <RemediationSummary
          icon={<Wrench size={19} />}
          label="Total Actions"
          count={actions.length}
          iconClass="bg-[#8B5CF6]/10 text-[#A78BFA]"
        />

        <RemediationSummary
          icon={<CheckCircle2 size={19} />}
          label="Completed"
          count={completedCount}
          iconClass="bg-[#22C55E]/10 text-[#22C55E]"
        />

        <RemediationSummary
          icon={<Clock3 size={19} />}
          label="In Progress"
          count={inProgressCount}
          iconClass="bg-[#C084FC]/10 text-[#C084FC]"
        />

        <RemediationSummary
          icon={<AlertTriangle size={19} />}
          label="Pending"
          count={pendingCount}
          iconClass="bg-[#F59E0B]/10 text-[#F59E0B]"
        />
      </div>

      {/* Actions */}
      <div className="rounded-2xl border border-white/10 bg-[#0B0914]">
        <div className="border-b border-white/10 px-6 py-5">
          <h2 className="font-semibold text-white">
            Remediation Actions
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Security improvements and corrective actions across your environment
          </p>
        </div>

        {actions.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <Shield size={34} className="mx-auto text-gray-600" />

            <p className="mt-3 text-sm font-medium text-gray-300">
              No remediation actions
            </p>

            <p className="mt-1 text-xs text-gray-600">
              Remediation actions will appear here when security issues require
              corrective action.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {actions.map((action) => (
              <RemediationRow
                key={action.id}
                action={action}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RemediationSummary({
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

function RemediationRow({
  action,
}: {
  action: RemediationAction;
}) {
  const status = action.status?.toLowerCase() || "unknown";

  const statusClass =
    status === "completed" ||
    status === "resolved" ||
    status === "success"
      ? "bg-[#22C55E]/10 text-[#22C55E]"
      : status === "pending" ||
          status === "open" ||
          status === "queued"
        ? "bg-[#F59E0B]/10 text-[#F59E0B]"
        : status === "in progress" ||
            status === "in-progress" ||
            status === "running"
          ? "bg-[#C084FC]/10 text-[#C084FC]"
          : "bg-white/5 text-gray-400";

  return (
    <div className="px-6 py-5 transition hover:bg-white/[0.02]">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        {/* Action information */}
        <div className="flex min-w-0 gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#8B5CF6]/10">
            <Wrench size={19} className="text-[#A78BFA]" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-white">
                {action.title}
              </h3>

              <span
                className={`rounded-lg px-2.5 py-1 text-[10px] font-semibold uppercase ${statusClass}`}
              >
                {action.status}
              </span>
            </div>

            <p className="mt-2 max-w-3xl text-xs leading-5 text-gray-500">
              {action.action}
            </p>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-gray-600">
              <span>
                Finding:{" "}
                <span className="text-gray-400">
                  {action.finding?.title || action.findingId}
                </span>
              </span>

              <span>
                Resource:{" "}
                <span className="text-gray-400">
                  {action.finding?.resource?.name ||
                    action.finding?.resourceId ||
                    "Unknown"}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Risk Reduction */}
        <div className="shrink-0 rounded-xl border border-[#22C55E]/10 bg-[#22C55E]/5 px-4 py-3 lg:min-w-[130px]">
          <p className="text-[10px] uppercase tracking-wider text-gray-600">
            Risk Reduction
          </p>

          <p className="mt-1 text-sm font-semibold text-[#22C55E]">
            {action.riskReduction}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Remediation;
