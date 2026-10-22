import { Link } from "react-router-dom";
import { AlertTriangle, Cloud, RefreshCw } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ConnectionState } from "../hooks/useApiData";

export function PageLoading({ label }: { label: string }) {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#8B5CF6] border-t-transparent" />

        <p className="mt-4 text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export function PageError({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-2xl border border-[#EF4444]/20 bg-[#0B0914] p-6">
      <div className="flex items-start gap-3">
        <AlertTriangle
          size={20}
          className="mt-0.5 shrink-0 text-[#EF4444]"
        />

        <div className="min-w-0">
          <h2 className="font-semibold text-white">{title}</h2>

          <p className="mt-1 text-sm text-gray-500">{message}</p>

          <button
            type="button"
            onClick={onRetry}
            className="mt-4 flex items-center gap-2 rounded-lg bg-[#EF4444]/10 px-4 py-2 text-sm font-medium text-red-200 hover:bg-[#EF4444]/20"
          >
            <RefreshCw size={15} />
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}

export function PageEmpty({
  icon: Icon = Cloud,
  title,
  message,
  actionLabel,
  actionTo,
  compact = false,
  good = false,
}: {
  icon?: LucideIcon;
  title: string;
  message: string;
  actionLabel?: string;
  actionTo?: string;
  compact?: boolean;
  good?: boolean;
}) {
  return (
    <div
      className={
        compact
          ? "px-6 py-12 text-center"
          : "rounded-2xl border border-white/10 bg-[#0B0914] px-6 py-16 text-center"
      }
    >
      <Icon
        size={compact ? 32 : 36}
        className={`mx-auto ${good ? "text-[#22C55E]" : "text-gray-600"}`}
      />

      <p className="mt-3 text-sm font-medium text-gray-300">{title}</p>

      <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-gray-600">
        {message}
      </p>

      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="mt-5 inline-flex items-center rounded-lg bg-[#8B5CF6] px-4 py-2 text-sm font-medium text-white hover:bg-[#7C3AED]"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

/*
 * Empty list message that depends on whether AWS is connected and scanned.
 */
export function ConnectionEmpty({
  connection,
  noun,
  icon,
  emptyTitle,
  emptyMessage,
  good = false,
  compact = true,
}: {
  connection: ConnectionState | null;
  noun: string;
  icon?: LucideIcon;
  emptyTitle: string;
  emptyMessage: string;
  good?: boolean;
  compact?: boolean;
}) {
  if (connection === "NOT_CONNECTED") {
    return (
      <PageEmpty
        icon={icon}
        compact={compact}
        title={`No ${noun} yet`}
        message={`Connect an AWS account to start seeing your ${noun}.`}
        actionLabel="Connect AWS"
        actionTo="/connect"
      />
    );
  }

  if (connection === "NO_DATA") {
    return (
      <PageEmpty
        icon={icon}
        compact={compact}
        title="Waiting for your first scan"
        message={`Your AWS account is connected. Run a scan from the dashboard to discover your ${noun}.`}
        actionLabel="Go to dashboard"
        actionTo="/dashboard"
      />
    );
  }

  return (
    <PageEmpty
      icon={icon}
      compact={compact}
      good={good}
      title={emptyTitle}
      message={emptyMessage}
    />
  );
}