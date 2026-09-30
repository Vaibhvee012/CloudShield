import {
  Activity,
  CheckCircle2,
  Clock3,
  FileClock,
  ShieldAlert,
  User,
} from "lucide-react";

function AuditLogs() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8B5CF6]/10">
            <FileClock size={21} className="text-[#A78BFA]" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Audit Logs
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Track security and administrative activities.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={<Activity size={18} />}
          label="Total Events"
          value="0"
        />

        <SummaryCard
          icon={<ShieldAlert size={18} />}
          label="Security Events"
          value="0"
        />

        <SummaryCard
          icon={<User size={18} />}
          label="Administrative"
          value="0"
        />

        <SummaryCard
          icon={<CheckCircle2 size={18} />}
          label="Successful"
          value="0"
        />
      </div>

      {/* Activity History */}
      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#0B0914] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">
            Activity History
          </h2>

          <p className="mt-1 text-xs text-gray-600">
            Security and administrative events will appear here.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-lg border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-3 py-2 text-xs text-[#A78BFA]"
          >
            All Events
          </button>

          <button
            type="button"
            className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-gray-400 transition hover:border-[#8B5CF6]/30 hover:text-white"
          >
            Recent
          </button>
        </div>
      </div>

      {/* Empty State */}
      <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0B0914] px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8B5CF6]/10">
          <Clock3 size={25} className="text-[#A78BFA]" />
        </div>

        <h2 className="mt-5 text-base font-semibold text-white">
          No audit events yet
        </h2>

        <p className="mt-2 max-w-md text-sm leading-6 text-gray-600">
          Security scans, authentication events, administrative actions, and
          remediation activities will be recorded here.
        </p>
      </div>

      {/* Information */}
      <div className="rounded-2xl border border-[#8B5CF6]/10 bg-[#8B5CF6]/5 p-5">
        <div className="flex items-start gap-3">
          <FileClock
            size={18}
            className="mt-0.5 shrink-0 text-[#A78BFA]"
          />

          <div>
            <p className="text-xs font-semibold text-[#A78BFA]">
              Audit Trail
            </p>

            <p className="mt-1 text-[11px] leading-5 text-gray-500">
              CloudShield will maintain an activity history for important
              security and administrative operations. Backend persistence will
              be connected when audit logging is implemented.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0B0914] p-5">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#8B5CF6]/10 text-[#A78BFA]">
          {icon}
        </div>

        <span className="text-[10px] uppercase tracking-wider text-gray-700">
          Ready
        </span>
      </div>

      <p className="mt-4 text-xs text-gray-500">{label}</p>

      <p className="mt-1 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

export default AuditLogs;