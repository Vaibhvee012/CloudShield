import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  FileClock,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";

import { PageEmpty, PageError } from "../components/PageState";
import {
  AUDIT_ACTION_OPTIONS,
  auditLabel,
  reasonLabel,
} from "../lib/auditLabels";
import { ApiError, getAuditLogs } from "../services/api";

interface AuditEvent {
  id: string;
  createdAt: string;
  action: string;
  outcome: string;
  targetType: string | null;
  targetId: string | null;
  metadata: Record<string, unknown> | null;
  ip: string | null;
}

const PAGE_SIZE = 25;

const OUTCOME_FILTERS = [
  { value: "", label: "All events" },
  { value: "SUCCESS", label: "Successful" },
  { value: "FAILURE", label: "Failed" },
  { value: "DENIED", label: "Blocked" },
];

const formatTime = (iso: string) => {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) return "Unknown time";

  return date.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const humanizeKey = (key: string) =>
  key.replace(/([A-Z])/g, " $1").toLowerCase();

// Only plain values are shown, never raw objects.
const metadataItems = (metadata: AuditEvent["metadata"]) => {
  if (!metadata) return [];

  return Object.entries(metadata)
    .filter(
      ([, value]) =>
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
    )
    .map(([key, value]) =>
      key === "reason"
        ? `Reason: ${reasonLabel(String(value))}`
        : `${humanizeKey(key)}: ${String(value)}`
    );
};

function AuditLogs() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [outcome, setOutcome] = useState("");
  const [action, setAction] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [moreError, setMoreError] = useState("");

  // Ignores answers from requests that were replaced by a newer one.
  const requestId = useRef(0);

  const loadFirst = useCallback(
    async (nextOutcome: string, nextAction: string) => {
      const id = ++requestId.current;

      try {
        const response = await getAuditLogs(PAGE_SIZE, {
          outcome: nextOutcome || undefined,
          action: nextAction || undefined,
        });

        if (id !== requestId.current) return;

        setEvents(response?.data ?? []);
        setNextCursor(response?.nextCursor ?? null);
        setError("");
      } catch (err) {
        if (id !== requestId.current) return;

        setError(
          err instanceof ApiError ? err.message : "Failed to load audit logs"
        );
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadFirst("", "");
  }, [loadFirst]);

  const changeOutcome = (value: string) => {
    setOutcome(value);
    setLoading(true);
    loadFirst(value, action);
  };

  const changeAction = (value: string) => {
    setAction(value);
    setLoading(true);
    loadFirst(outcome, value);
  };

  const retry = () => {
    setLoading(true);
    loadFirst(outcome, action);
  };

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;

    const id = requestId.current;

    setLoadingMore(true);
    setMoreError("");

    try {
      const response = await getAuditLogs(PAGE_SIZE, {
        cursor: nextCursor,
        outcome: outcome || undefined,
        action: action || undefined,
      });

      if (id !== requestId.current) return;

      setEvents((previous) => [...previous, ...(response?.data ?? [])]);
      setNextCursor(response?.nextCursor ?? null);
    } catch (err) {
      setMoreError(
        err instanceof ApiError
          ? err.message
          : "Failed to load more events"
      );
    } finally {
      setLoadingMore(false);
    }
  };

  const successCount = events.filter((e) => e.outcome === "SUCCESS").length;
  const failedCount = events.filter((e) => e.outcome === "FAILURE").length;
  const blockedCount = events.filter((e) => e.outcome === "DENIED").length;

  const show = (value: number) => (loading || error ? "—" : String(value));
  const filtered = outcome !== "" || action !== "";

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
              Security-relevant activity on your account.
            </p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            icon={<Activity size={18} />}
            label="Events loaded"
            value={show(events.length)}
          />

          <SummaryCard
            icon={<CheckCircle2 size={18} />}
            label="Successful"
            value={show(successCount)}
          />

          <SummaryCard
            icon={<AlertTriangle size={18} />}
            label="Failed"
            value={show(failedCount)}
          />

          <SummaryCard
            icon={<ShieldAlert size={18} />}
            label="Blocked"
            value={show(blockedCount)}
          />
        </div>

        <p className="mt-2 text-[11px] text-gray-700">
          Counts cover the events loaded below.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#0B0914] p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {OUTCOME_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => changeOutcome(filter.value)}
              className={`rounded-lg border px-3 py-2 text-xs transition ${
                outcome === filter.value
                  ? "border-[#8B5CF6]/30 bg-[#8B5CF6]/10 text-[#A78BFA]"
                  : "border-white/10 bg-white/[0.03] text-gray-400 hover:border-[#8B5CF6]/30 hover:text-white"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <select
          value={action}
          onChange={(event) => changeAction(event.target.value)}
          className="rounded-lg border border-white/10 bg-[#0B0914] px-3 py-2 text-xs text-gray-300 outline-none focus:border-[#8B5CF6]/40"
          aria-label="Filter by activity type"
        >
          <option value="">All activity</option>

          {AUDIT_ACTION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Events */}
      {error ? (
        <PageError
          title="Unable to load audit logs"
          message={error}
          onRetry={retry}
        />
      ) : loading ? (
        <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-white/10 bg-[#0B0914]">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#8B5CF6] border-t-transparent" />

            <p className="mt-4 text-sm text-gray-500">
              Loading audit events...
            </p>
          </div>
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#0B0914]">
          <PageEmpty
            compact
            icon={FileClock}
            title={
              filtered ? "No events match these filters" : "No audit events yet"
            }
            message={
              filtered
                ? "Try a different filter to see more of your activity."
                : "Your sign-ins, scans and AI requests will appear here."
            }
          />

          {filtered && (
            <div className="pb-8 text-center">
              <button
                type="button"
                onClick={() => {
                  setOutcome("");
                  setAction("");
                  setLoading(true);
                  loadFirst("", "");
                }}
                className="rounded-lg border border-white/10 px-4 py-2 text-xs text-gray-300 hover:border-[#8B5CF6]/30 hover:text-white"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-[#0B0914]">
          <div className="divide-y divide-white/5">
            {events.map((event) => (
              <EventRow key={event.id} event={event} />
            ))}
          </div>

          {(nextCursor || moreError) && (
            <div className="border-t border-white/10 px-6 py-4 text-center">
              {moreError && (
                <p className="mb-3 text-xs text-red-300">{moreError}</p>
              )}

              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-gray-300 transition hover:border-[#8B5CF6]/30 hover:text-white disabled:opacity-60"
              >
                <RefreshCw
                  size={13}
                  className={loadingMore ? "animate-spin" : ""}
                />

                {loadingMore ? "Loading..." : "Load more"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Information */}
      <div className="rounded-2xl border border-[#8B5CF6]/10 bg-[#8B5CF6]/5 p-5">
        <div className="flex items-start gap-3">
          <FileClock
            size={18}
            className="mt-0.5 shrink-0 text-[#A78BFA]"
          />

          <div>
            <p className="text-xs font-semibold text-[#A78BFA]">
              Audit trail
            </p>

            <p className="mt-1 text-[11px] leading-5 text-gray-500">
              CloudShield records sign-ins, AWS connection changes, scans, AI
              requests and blocked access attempts on your account. Passwords,
              access tokens, AI questions and AI answers are never stored. You
              can only see your own events.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function EventRow({ event }: { event: AuditEvent }) {
  const tone =
    event.outcome === "SUCCESS"
      ? {
          icon: <CheckCircle2 size={18} />,
          iconClass: "bg-[#22C55E]/10 text-[#22C55E]",
          badgeClass: "bg-[#22C55E]/10 text-[#22C55E]",
          label: "Successful",
        }
      : event.outcome === "DENIED"
        ? {
            icon: <ShieldAlert size={18} />,
            iconClass: "bg-[#EF4444]/10 text-[#EF4444]",
            badgeClass: "bg-[#EF4444]/10 text-[#EF4444]",
            label: "Blocked",
          }
        : {
            icon: <AlertTriangle size={18} />,
            iconClass: "bg-[#F59E0B]/10 text-[#F59E0B]",
            badgeClass: "bg-[#F59E0B]/10 text-[#F59E0B]",
            label: "Failed",
          };

  const items = metadataItems(event.metadata);

  const target =
    event.targetType && event.targetId
      ? `${event.targetType}: ${
          event.targetId.length > 28
            ? `${event.targetId.slice(0, 28)}...`
            : event.targetId
        }`
      : event.targetType;

  return (
    <div className="px-6 py-4 transition hover:bg-white/[0.02]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-4">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone.iconClass}`}
          >
            {tone.icon}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-white">
                {auditLabel(event.action)}
              </h3>

              <span
                className={`rounded-lg px-2.5 py-1 text-[10px] font-semibold uppercase ${tone.badgeClass}`}
              >
                {tone.label}
              </span>
            </div>

            {(target || event.ip) && (
              <p
                className="mt-1 truncate text-xs text-gray-600"
                title={event.targetId ?? undefined}
              >
                {[target, event.ip ? `IP ${event.ip}` : null]
                  .filter(Boolean)
                  .join("  ·  ")}
              </p>
            )}

            {items.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {items.map((item) => (
                  <span
                    key={item}
                    className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-gray-400"
                  >
                    {item}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <span className="shrink-0 text-[11px] text-gray-600">
          {formatTime(event.createdAt)}
        </span>
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0B0914] p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#8B5CF6]/10 text-[#A78BFA]">
        {icon}
      </div>

      <p className="mt-4 text-xs text-gray-500">{label}</p>

      <p className="mt-1 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

export default AuditLogs;