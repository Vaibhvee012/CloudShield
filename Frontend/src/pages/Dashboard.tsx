import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bot,
  ChevronRight,
  Cloud,
  Database,
  RefreshCw,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  ApiError,
  getAuditLogs,
  getSecurityPosture,
  getFindings,
  getRemediationActions,
  fullAWSSync,
  getAWSSyncStatus,
  getAWSResources,
  getDashboardAIInsight,
} from "../services/api";

type PostureState = "NOT_CONNECTED" | "NO_DATA" | "READY";

type SecurityData = {
  state: PostureState;
  score: number | null;
  totalFindings: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  resourcesTotal: number;
  healthyResources: number;
  healthPercentage: number;
};

type Finding = {
  id: string;
  title: string;
  severity: string;
  resourceId: string;
  status: string;
  createdAt: string;
  resource?: {
    name: string;
  };
};

type ResourceRow = {
  type?: string;
  status?: string;
};

type AuditRow = {
  id: string;
  createdAt: string;
  action: string;
  outcome: string;
};

type InsightState = {
  state: string;
  text: string;
};

type Banner = {
  type: "success" | "error" | "info";
  text: string;
};

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof ApiError ? error.message : fallback;

const severityRank = (severity: string) => {
  switch (severity.toUpperCase()) {
    case "CRITICAL":
      return 0;
    case "HIGH":
      return 1;
    case "MEDIUM":
      return 2;
    case "LOW":
      return 3;
    default:
      return 4;
  }
};

const AUDIT_LABELS: Record<string, string> = {
  AUTH_LOGIN: "Sign-in",
  AUTH_REGISTER: "Account created",
  AWS_CONNECT: "AWS account connected",
  AWS_SYNC: "AWS scan",
  AWS_DISCONNECT: "AWS account disconnected",
  AI_CHAT: "AI assistant question",
  AI_EXPLAIN_FINDING: "AI finding explanation",
  AI_PRIORITIZE_RISKS: "AI risk prioritization",
  AI_SUGGEST_REMEDIATION: "AI remediation suggestion",
  AI_DASHBOARD_INSIGHT: "AI dashboard insight",
};

const describeAudit = (row: AuditRow) => ({
  title: AUDIT_LABELS[row.action] ?? row.action,
  description:
    row.outcome === "SUCCESS"
      ? "Completed"
      : row.outcome === "DENIED"
        ? "Blocked"
        : "Failed",
  ok: row.outcome === "SUCCESS",
});

const bannerStyles: Record<Banner["type"], string> = {
  success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  error: "border-red-500/20 bg-red-500/10 text-red-300",
  info: "border-purple-400/20 bg-purple-500/10 text-purple-200",
};

/*
 * Renders AI text safely: only React elements, never raw HTML.
 * Supports **bold** and "* " or "- " bullets.
 */
const InsightText = ({ text }: { text: string }) => {
  const lines = text
    .replace(/`/g, "")
    .split("\n")
    .map((line) => line.replace(/^#+\s*/, "").trim())
    .filter(Boolean);

  return (
    <div className="space-y-2 text-sm leading-6 text-slate-400">
      {lines.map((line, index) => {
        const isBullet = /^[*-]\s+/.test(line);
        const content = line.replace(/^[*-]\s+/, "");

        const parts = content
          .split(/(\*\*[^*]+\*\*)/g)
          .filter(Boolean)
          .map((part, partIndex) =>
            part.startsWith("**") && part.endsWith("**") ? (
              <strong
                key={partIndex}
                className="font-semibold text-slate-200"
              >
                {part.slice(2, -2)}
              </strong>
            ) : (
              <span key={partIndex}>{part}</span>
            )
          );

        return isBullet ? (
          <p key={index} className="flex gap-2">
            <span className="text-purple-300">•</span>
            <span>{parts}</span>
          </p>
        ) : (
          <p key={index}>{parts}</p>
        );
      })}
    </div>
  );
};

const Dashboard = () => {
  const [security, setSecurity] = useState<SecurityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [findings, setFindings] = useState<Finding[]>([]);
  const [remediationCount, setRemediationCount] = useState(0);
  const [awsResources, setAWSResources] = useState<ResourceRow[]>([]);
  const [activity, setActivity] = useState<AuditRow[]>([]);

  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<Banner | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const [insight, setInsight] = useState<InsightState | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState("");

  /*
   * Load dashboard data. No made-up fallback values: on failure the page
   * shows an error with a retry button.
   */
  const loadDashboardData = useCallback(async () => {
    try {
      setLoadError("");

      const [
        securityResponse,
        findingsResponse,
        remediationResponse,
        syncStatusResponse,
        awsResourcesResponse,
        auditResponse,
      ] = await Promise.all([
        getSecurityPosture(),
        getFindings(),
        getRemediationActions(),
        getAWSSyncStatus(),
        getAWSResources(),
        // Activity is nice to have: it must never break the dashboard.
        getAuditLogs(6).catch(() => null),
      ]);

      const data = securityResponse?.data;

      setSecurity({
        state: data?.state ?? "NOT_CONNECTED",
        score: data?.securityScore ?? null,
        totalFindings: data?.totalFindings ?? 0,
        critical: data?.severity?.critical ?? 0,
        high: data?.severity?.high ?? 0,
        medium: data?.severity?.medium ?? 0,
        low: data?.severity?.low ?? 0,
        resourcesTotal: data?.resources?.total ?? 0,
        healthyResources: data?.resources?.healthy ?? 0,
        healthPercentage: data?.resources?.healthPercentage ?? 0,
      });

      setFindings(findingsResponse?.data ?? []);
      setRemediationCount((remediationResponse?.data ?? []).length);
      setLastSyncedAt(syncStatusResponse?.data?.lastSyncedAt ?? null);
      setAWSResources(awsResourcesResponse?.data ?? []);
      setActivity(auditResponse?.data ?? []);
    } catch (error) {
      setLoadError(errorMessage(error, "Failed to load dashboard data."));
    } finally {
      setLoading(false);
    }
  }, []);

  /*
   * CloudShield AI dashboard insight. refresh=true forces a new one.
   */
  const fetchInsight = useCallback(async (refresh = false) => {
    try {
      setInsightLoading(true);
      setInsightError("");

      const response = await getDashboardAIInsight(refresh);

      setInsight({
        state: response?.data?.state ?? "READY",
        text: response?.data?.insight ?? "",
      });
    } catch (error) {
      setInsightError(
        errorMessage(
          error,
          "Unable to generate a security insight right now."
        )
      );
    } finally {
      setInsightLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
    fetchInsight();
  }, [loadDashboardData, fetchInsight]);

  const handleRetry = () => {
    setLoading(true);
    loadDashboardData();
    fetchInsight();
  };

  /*
   * Run a scan of all of this user's AWS connections
   */
  const handleAWSSync = async () => {
    try {
      setSyncing(true);
      setSyncMessage(null);

      const result = await fullAWSSync();
      const connectionsSynced = result?.data?.connectionsSynced ?? 0;

      setSyncMessage(
        connectionsSynced === 0
          ? {
              type: "info",
              text: "There is no AWS connection to scan yet. Connect an AWS account first.",
            }
          : {
              type: "success",
              text: `Scan complete: ${result?.data?.resourcesSynced ?? 0} resources and ${result?.data?.findingsSynced ?? 0} findings across ${connectionsSynced} connection${connectionsSynced === 1 ? "" : "s"}.`,
            }
      );

      if (result?.data?.lastSyncedAt) {
        setLastSyncedAt(result.data.lastSyncedAt);
      }

      await loadDashboardData();
      await fetchInsight();
    } catch (error) {
      setSyncMessage({
        type: "error",
        text: errorMessage(error, "AWS scan failed. Please try again."),
      });
    } finally {
      setSyncing(false);
    }
  };

  /*
   * Derived values
   */
  const state = security?.state ?? null;
  const ready = state === "READY";
  const view = ready ? security : null;

  const countByType = (type: string) =>
    awsResources.filter(
      (resource) => resource.type?.toLowerCase() === type
    );

  const getResourceStatus = (
    resources: ResourceRow[]
  ): "healthy" | "warning" =>
    resources.some((resource) => {
      const status = resource.status?.toLowerCase();
      return status === "disconnected" || status === "unhealthy";
    })
      ? "warning"
      : "healthy";

  const ec2Resources = countByType("ec2");
  const s3Resources = countByType("s3");
  const rdsResources = countByType("rds");

  const score = view?.score ?? 0;

  const scoreTone =
    score >= 80
      ? {
          chip: "bg-emerald-400/10",
          dot: "bg-emerald-400",
          text: "text-emerald-300",
          label: "Healthy",
          heading: "Your environment is well protected",
        }
      : score >= 60
        ? {
            chip: "bg-amber-400/10",
            dot: "bg-amber-400",
            text: "text-amber-300",
            label: "Monitor",
            heading: "Your environment needs some attention",
          }
        : {
            chip: "bg-red-400/10",
            dot: "bg-red-400",
            text: "text-red-300",
            label: "Needs attention",
            heading: "Your environment needs attention",
          };

  const topFindings = findings
    .filter((finding) => finding.status !== "RESOLVED")
    .sort((a, b) => severityRank(a.severity) - severityRank(b.severity))
    .slice(0, 3);

  const severityData = view
    ? [
        { name: "Critical", count: view.critical, color: "#f87171" },
        { name: "High", count: view.high, color: "#fb923c" },
        { name: "Medium", count: view.medium, color: "#fbbf24" },
        { name: "Low", count: view.low, color: "#94a3b8" },
      ]
    : [];

  const statusLabel = loading
    ? "Loading"
    : loadError
      ? "Unable to load data"
      : state === "NOT_CONNECTED"
        ? "No AWS account connected"
        : state === "NO_DATA"
          ? "Waiting for first scan"
          : "AWS account connected";

  const statusDot = loadError
    ? "bg-red-400 shadow-[0_0_12px_rgba(248,113,113,0.9)]"
    : ready
      ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]"
      : "bg-slate-500";

  const statusText = loadError
    ? "text-red-300"
    : ready
      ? "text-emerald-300"
      : "text-slate-400";

  const showBottom = !loading && !loadError && state !== "NOT_CONNECTED";

  return (
    <div className="min-h-screen bg-[#08070d] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[150px]" />

        <div className="absolute right-[-150px] top-[30%] h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[150px]" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "70px 70px",
          }}
        />
      </div>

      <div className="relative z-10 space-y-6 p-5 lg:p-8">
        {/* Header */}
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${statusDot}`} />

              <span
                className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${statusText}`}
              >
                {statusLabel}
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight lg:text-4xl">
              Security Command Center
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Visibility across your connected AWS environment.
            </p>
          </div>

          {!loading && !loadError && state !== "NOT_CONNECTED" && (
            <div className="flex items-center gap-3">
              {/* Last sync */}
              <div className="hidden rounded-xl border border-white/10 bg-white/[0.035] px-4 py-2.5 sm:block">
                <p className="text-[9px] uppercase tracking-wider text-slate-600">
                  Last security scan
                </p>

                <p className="mt-0.5 text-xs text-slate-300">
                  {lastSyncedAt
                    ? formatSyncTime(lastSyncedAt)
                    : "Not synced yet"}
                </p>
              </div>

              {/* Run scan */}
              <button
                onClick={handleAWSSync}
                disabled={syncing}
                className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-4 py-3 text-sm font-medium shadow-lg shadow-purple-900/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    syncing
                      ? "animate-spin"
                      : "transition group-hover:rotate-180"
                  }`}
                />

                {syncing ? "Scanning..." : "Run scan"}
              </button>
            </div>
          )}
        </div>

        {syncMessage && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${bannerStyles[syncMessage.type]}`}
          >
            {syncMessage.text}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.045] p-8 text-sm text-slate-400">
            <RefreshCw className="h-4 w-4 animate-spin text-purple-300" />
            Loading your security data...
          </div>
        )}

        {/* Error */}
        {!loading && loadError && (
          <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-8">
            <div className="flex items-center gap-2 text-red-300">
              <AlertTriangle className="h-5 w-5" />
              <h2 className="text-lg font-semibold">
                We could not load your dashboard
              </h2>
            </div>

            <p className="mt-2 text-sm text-red-200/80">{loadError}</p>

            <button
              onClick={handleRetry}
              className="mt-5 flex items-center gap-2 rounded-xl bg-red-500/20 px-4 py-2.5 text-sm font-medium text-red-100 hover:bg-red-500/30"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </div>
        )}

        {/* No AWS connection */}
        {!loading && !loadError && state === "NOT_CONNECTED" && (
          <div className="relative overflow-hidden rounded-3xl border border-purple-400/20 bg-gradient-to-br from-purple-600/15 via-violet-600/[0.06] to-transparent p-10 text-center">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-purple-500/20 blur-[80px]" />

            <div className="relative mx-auto max-w-xl">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-purple-400/20 bg-purple-500/10">
                <Cloud className="h-7 w-7 text-purple-300" />
              </div>

              <h2 className="mt-5 text-2xl font-semibold">
                Connect your AWS account
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                CloudShield reads your AWS configuration, flags
                misconfigurations and helps you decide what to fix first. It
                never changes your resources.
              </p>

              <Link
                to="/connect"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold shadow-lg shadow-purple-900/20 hover:bg-purple-500"
              >
                Connect AWS
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Connected, nothing scanned yet */}
        {!loading && !loadError && state === "NO_DATA" && (
          <div className="rounded-3xl border border-purple-400/20 bg-purple-500/10 p-6">
            <h2 className="text-lg font-semibold">
              Your AWS account is connected
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              No resources have been scanned yet. Run your first scan to see
              your security score, findings and resources.
            </p>
          </div>
        )}

        {/* Full dashboard */}
        {view && (
          <>
            {/* Main Security Posture */}
            <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
              {/* Security Score */}
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045] p-7 shadow-2xl shadow-black/20">
                <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-purple-600/10 blur-[90px]" />

                <div className="relative flex h-full flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-purple-300" />

                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-300">
                        Overall security posture
                      </span>
                    </div>

                    <h2 className="mt-3 text-2xl font-semibold">
                      {scoreTone.heading}
                    </h2>

                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                      {view.totalFindings === 0
                        ? "No open findings in your latest scan."
                        : `${view.totalFindings} open finding${view.totalFindings === 1 ? "" : "s"} across ${view.resourcesTotal} resource${view.resourcesTotal === 1 ? "" : "s"}. Review them below.`}
                    </p>
                  </div>

                  <div className="mt-8 grid items-center gap-8 md:grid-cols-[230px_1fr]">
                    {/* Score */}
                    <div className="relative mx-auto flex h-[210px] w-[210px] items-center justify-center">
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: `conic-gradient(#8B5CF6 ${
                            score * 3.6
                          }deg, rgba(255,255,255,0.05) ${
                            score * 3.6
                          }deg)`,
                        }}
                      />

                      <div className="absolute inset-[9px] rounded-full bg-[#0b0a11]" />

                      <div className="absolute inset-[25px] rounded-full border border-purple-400/10" />

                      <div className="relative z-10 text-center">
                        <p className="text-5xl font-semibold tracking-tight">
                          {score}
                        </p>

                        <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-slate-500">
                          Security score
                        </p>

                        <div
                          className={`mx-auto mt-3 flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 ${scoreTone.chip}`}
                        >
                          <div
                            className={`h-1.5 w-1.5 rounded-full ${scoreTone.dot}`}
                          />

                          <span
                            className={`text-[10px] font-medium ${scoreTone.text}`}
                          >
                            {scoreTone.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Score Breakdown */}
                    <div className="space-y-5">
                      <div>
                        <div className="mb-2 flex justify-between">
                          <span className="text-xs text-slate-400">
                            Healthy resources
                          </span>

                          <span className="text-xs font-semibold text-white">
                            {view.healthPercentage}%
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-white/5">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-purple-600 to-violet-400"
                            style={{
                              width: `${view.healthPercentage}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <PostureStat
                          label="Critical"
                          value={view.critical}
                          icon={<ShieldAlert className="h-4 w-4" />}
                          type="critical"
                        />

                        <PostureStat
                          label="High risk"
                          value={view.high}
                          icon={<AlertTriangle className="h-4 w-4" />}
                          type="high"
                        />

                        <PostureStat
                          label="Medium"
                          value={view.medium}
                          icon={<Activity className="h-4 w-4" />}
                          type="medium"
                        />

                        <PostureStat
                          label="Resources"
                          value={view.resourcesTotal}
                          icon={<Cloud className="h-4 w-4" />}
                          type="normal"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Infrastructure */}
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045] p-6">
                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-purple-600/10 blur-[70px]" />

                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Cloud infrastructure
                      </p>

                      <h3 className="mt-2 text-lg font-semibold">
                        Connected environment
                      </h3>
                    </div>

                    <Cloud className="h-5 w-5 text-purple-300" />
                  </div>

                  {/* Cloud Map */}
                  <div className="relative mt-6 h-[250px] overflow-hidden rounded-2xl border border-white/5 bg-[#090811]">
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute left-1/2 top-1/2 h-px w-full -translate-x-1/2 bg-purple-500" />

                      <div className="absolute left-1/2 top-1/2 h-full w-px -translate-y-1/2 bg-purple-500" />
                    </div>

                    <div className="absolute left-[27%] top-[48%] h-px w-[25%] rotate-[-20deg] bg-gradient-to-r from-purple-500/20 to-purple-400/60" />

                    <div className="absolute right-[27%] top-[48%] h-px w-[25%] rotate-[20deg] bg-gradient-to-l from-purple-500/20 to-purple-400/60" />

                    <div className="absolute left-1/2 top-[35%] h-[30%] w-px bg-gradient-to-b from-purple-400/50 to-transparent" />

                    {/* Center */}
                    <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-400/30 bg-purple-500/10 shadow-[0_0_35px_rgba(139,92,246,0.2)]">
                        <ShieldCheck className="h-8 w-8 text-purple-300" />
                      </div>

                      <span className="mt-2 text-[9px] uppercase tracking-widest text-purple-300">
                        CloudShield
                      </span>
                    </div>

                    <InfrastructureNode
                      className="left-[10%] top-[24%]"
                      icon={<Database className="h-4 w-4" />}
                      label={`S3 · ${s3Resources.length}`}
                      status={getResourceStatus(s3Resources)}
                    />

                    <InfrastructureNode
                      className="right-[10%] top-[24%]"
                      icon={<Server className="h-4 w-4" />}
                      label={`EC2 · ${ec2Resources.length}`}
                      status={getResourceStatus(ec2Resources)}
                    />

                    <InfrastructureNode
                      className="bottom-[12%] left-[12%]"
                      icon={<Database className="h-4 w-4" />}
                      label={`RDS · ${rdsResources.length}`}
                      status={getResourceStatus(rdsResources)}
                    />

                    <InfrastructureNode
                      className="bottom-[12%] right-[12%]"
                      icon={<Cloud className="h-4 w-4" />}
                      label={`All · ${awsResources.length}`}
                      status={getResourceStatus(awsResources)}
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      {view.resourcesTotal} resources synced
                    </span>

                    <Link
                      to="/resources"
                      className="flex items-center gap-1 text-purple-300 hover:text-purple-200"
                    >
                      View resources
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                icon={<ShieldAlert />}
                label="Open findings"
                value={view.totalFindings}
                detail="Requires review"
                trend="Open"
                tone="purple"
              />

              <MetricCard
                icon={<AlertTriangle />}
                label="Critical findings"
                value={view.critical}
                detail={
                  view.critical === 0 ? "None open" : "Review first"
                }
                trend={view.critical === 0 ? "Clear" : "Action needed"}
                tone="red"
              />

              <MetricCard
                icon={<Cloud />}
                label="Cloud resources"
                value={view.resourcesTotal}
                detail={`${view.healthyResources} healthy`}
                trend="Synced"
                tone="blue"
              />

              <MetricCard
                icon={<Zap />}
                label="Remediation suggestions"
                value={remediationCount.toString().padStart(2, "0")}
                detail={
                  remediationCount === 1
                    ? "Suggestion available"
                    : "Suggestions available"
                }
                trend="Advisory only"
                tone="green"
              />
            </div>

            {/* Analytics */}
            <div className="grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">
              {/* Severity chart */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-6">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-purple-300" />

                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Findings overview
                  </span>
                </div>

                <h3 className="mt-2 text-2xl font-semibold">
                  Open findings by severity
                </h3>

                <p className="mt-1 text-xs text-slate-600">
                  Based on your latest scan
                </p>

                <div className="mt-6 h-[270px]">
                  {view.totalFindings === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-slate-500">
                      No open findings to chart.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={severityData}>
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#475569", fontSize: 11 }}
                        />

                        <YAxis
                          allowDecimals={false}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#475569", fontSize: 10 }}
                        />

                        <Tooltip
                          cursor={{ fill: "rgba(255,255,255,0.04)" }}
                          contentStyle={{
                            background: "#111019",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "12px",
                            color: "#fff",
                          }}
                          labelStyle={{ color: "#94a3b8" }}
                        />

                        <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                          {severityData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Threat Center */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-red-400" />

                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Threat center
                      </span>
                    </div>

                    <h3 className="mt-2 text-xl font-semibold">
                      Top security risks
                    </h3>
                  </div>

                  <Link
                    to="/findings"
                    className="text-xs text-purple-300 hover:text-purple-200"
                  >
                    View all
                  </Link>
                </div>

                <div className="mt-5 space-y-3">
                  {topFindings.length === 0 ? (
                    <div className="rounded-xl border border-white/5 bg-black/10 p-5 text-center">
                      <ShieldCheck className="mx-auto h-6 w-6 text-emerald-400" />

                      <p className="mt-2 text-xs text-slate-400">
                        No open security findings
                      </p>
                    </div>
                  ) : (
                    topFindings.map((finding) => (
                      <FindingCard
                        key={finding.id}
                        title={finding.title}
                        resource={
                          finding.resource?.name || finding.resourceId
                        }
                        severity={finding.severity}
                        time={formatFindingTime(finding.createdAt)}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Bottom: AI + activity */}
        {showBottom && (
          <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
            {/* AI */}
            <div className="relative overflow-hidden rounded-3xl border border-purple-400/20 bg-gradient-to-br from-purple-600/15 via-violet-600/[0.06] to-transparent p-6">
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-purple-500/20 blur-[80px]" />

              <div className="relative">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-500/10">
                    <Sparkles className="h-5 w-5 text-purple-300" />
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-purple-300">
                      CloudShield AI
                    </p>

                    <h3 className="mt-1 text-lg font-semibold">
                      Security intelligence
                    </h3>
                  </div>
                </div>

                <div className="mt-5 min-h-[72px]">
                  {insightLoading ? (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <RefreshCw className="h-4 w-4 animate-spin text-purple-300" />
                      Analyzing your cloud security posture...
                    </div>
                  ) : insightError ? (
                    <p className="text-sm leading-6 text-amber-300">
                      {insightError}
                    </p>
                  ) : insight?.text ? (
                    <InsightText text={insight.text} />
                  ) : (
                    <p className="text-sm leading-6 text-slate-500">
                      No insight available yet.
                    </p>
                  )}
                </div>

                <p className="mt-4 text-[10px] text-slate-600">
                  Advisory only. CloudShield never changes your AWS resources.
                </p>

                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => fetchInsight(true)}
                    disabled={insightLoading || !ready}
                    className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-semibold shadow-lg shadow-purple-900/20 hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Bot className="h-4 w-4" />

                    {insightLoading ? "Analyzing..." : "Refresh insight"}
                  </button>

                  <Link
                    to="/assistant"
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Ask the assistant
                  </Link>
                </div>
              </div>
            </div>

            {/* Activity */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-purple-300" />

                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Your account
                    </span>
                  </div>

                  <h3 className="mt-2 text-xl font-semibold">
                    Recent activity
                  </h3>
                </div>

                <Link
                  to="/audit-logs"
                  className="text-xs text-purple-300 hover:text-purple-200"
                >
                  View all
                </Link>
              </div>

              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {activity.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    No recent activity yet.
                  </p>
                ) : (
                  activity.slice(0, 4).map((row) => {
                    const item = describeAudit(row);
                    const Icon = item.ok ? ShieldCheck : AlertTriangle;

                    return (
                      <div
                        key={row.id}
                        className="group flex items-center gap-3 rounded-xl border border-white/5 bg-black/10 p-3 transition hover:border-purple-400/20 hover:bg-purple-500/[0.04]"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5">
                          <Icon
                            className={`h-4 w-4 ${
                              item.ok ? "text-purple-300" : "text-amber-400"
                            }`}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-slate-200">
                            {item.title}
                          </p>

                          <p className="mt-0.5 truncate text-[10px] text-slate-600">
                            {item.description}
                          </p>
                        </div>

                        <span className="text-[9px] text-slate-600">
                          {formatFindingTime(row.createdAt)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col justify-between gap-3 border-t border-white/5 pt-5 text-[10px] text-slate-600 sm:flex-row">
          <span>CloudShield Security Platform</span>

          <span>
            Read-only access. CloudShield never changes your AWS resources.
          </span>
        </div>
      </div>
    </div>
  );
};


/* ---------------- COMPONENTS ---------------- */

type PostureStatProps = {
  label: string;
  value: number;
  icon: React.ReactNode;
  type: "critical" | "high" | "medium" | "normal";
};

const PostureStat = ({
  label,
  value,
  icon,
  type,
}: PostureStatProps) => {
  const styles = {
    critical:
      "text-red-400 bg-red-500/10 border-red-500/10",
    high:
      "text-orange-400 bg-orange-500/10 border-orange-500/10",
    medium:
      "text-amber-400 bg-amber-500/10 border-amber-500/10",
    normal:
      "text-purple-300 bg-purple-500/10 border-purple-500/10",
  };

  return (
    <div className="rounded-xl border border-white/5 bg-black/10 p-3">
      <div className="flex items-center justify-between">
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-lg ${styles[type]}`}
        >
          {icon}
        </div>

        <span className="text-lg font-semibold">
          {value}
        </span>
      </div>

      <p className="mt-2 text-[10px] text-slate-500">
        {label}
      </p>
    </div>
  );
};

type MetricCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  detail: string;
  trend: string;
  tone: "purple" | "red" | "blue" | "green";
};

const MetricCard = ({
  icon,
  label,
  value,
  detail,
  trend,
  tone,
}: MetricCardProps) => {
  const iconStyles = {
    purple:
      "bg-purple-500/10 text-purple-300",
    red:
      "bg-red-500/10 text-red-400",
    blue:
      "bg-blue-500/10 text-blue-400",
    green:
      "bg-emerald-500/10 text-emerald-400",
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-purple-400/20 hover:bg-white/[0.055]">
      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-purple-600/5 blur-2xl transition group-hover:bg-purple-600/10" />

      <div className="relative">
        <div className="flex items-center justify-between">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconStyles[tone]}`}
          >
            <span className="[&>svg]:h-5 [&>svg]:w-5">
              {icon}
            </span>
          </div>

          <span className="rounded-full bg-white/5 px-2 py-1 text-[9px] text-slate-500">
            {trend}
          </span>
        </div>

        <p className="mt-5 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-600">
          {label}
        </p>

        <div className="mt-1 flex items-end gap-2">
          <span className="text-3xl font-semibold tracking-tight">
            {value}
          </span>

          <span className="mb-1 text-[10px] text-slate-600">
            {detail}
          </span>
        </div>
      </div>
    </div>
  );
};

type InfrastructureNodeProps = {
  className: string;
  icon: React.ReactNode;
  label: string;
  status: "healthy" | "warning";
};

const InfrastructureNode = ({
  className,
  icon,
  label,
  status,
}: InfrastructureNodeProps) => {
  return (
    <div className={`absolute ${className}`}>
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 backdrop-blur-md">
        <div className="text-slate-400">
          {icon}
        </div>

        <div>
          <p className="text-[9px] font-medium text-slate-300">
            {label}
          </p>

          <div className="mt-1 flex items-center gap-1.5">
            <div
              className={`h-1.5 w-1.5 rounded-full ${
                status === "healthy"
                  ? "bg-emerald-400 shadow-[0_0_7px_rgba(52,211,153,0.8)]"
                  : "bg-amber-400 shadow-[0_0_7px_rgba(251,191,36,0.8)]"
              }`}
            />

            <span className="text-[8px] text-slate-600">
              {status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

type FindingCardProps = {
  title: string;
  resource: string;
  severity: string;
  time: string;
};

const FindingCard = ({
  title,
  resource,
  severity,
  time,
}: FindingCardProps) => {
  const normalizedSeverity =
    severity.toUpperCase();

  const severityStyle =
    normalizedSeverity === "CRITICAL"
      ? "text-red-400 bg-red-500/10 border-red-500/10"
      : normalizedSeverity === "HIGH"
        ? "text-orange-400 bg-orange-500/10 border-orange-500/10"
        : normalizedSeverity === "MEDIUM"
          ? "text-amber-400 bg-amber-500/10 border-amber-500/10"
          : "text-slate-400 bg-slate-500/10 border-slate-500/10";

  const dotStyle =
    normalizedSeverity === "CRITICAL"
      ? "bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.8)]"
      : normalizedSeverity === "HIGH"
        ? "bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.6)]"
        : normalizedSeverity === "MEDIUM"
          ? "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.6)]"
          : "bg-slate-400";

  return (
    <div className="group rounded-xl border border-white/5 bg-black/10 p-4 transition hover:border-purple-400/20 hover:bg-purple-500/[0.03]">
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${dotStyle}`}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-medium text-slate-200">
              {title}
            </p>

            <span
              className={`shrink-0 rounded-full border px-2 py-1 text-[8px] font-semibold uppercase ${severityStyle}`}
            >
              {severity}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <span className="truncate text-[10px] text-slate-600">
              {resource}
            </span>

            <span className="text-[9px] text-slate-700">
              {time}
            </span>
          </div>
        </div>
      </div>

      <button className="mt-3 flex items-center gap-1 text-[10px] text-purple-300 opacity-0 transition group-hover:opacity-100">
        Investigate
        <ArrowUpRight className="h-3 w-3" />
      </button>
    </div>
  );
};

/* ---------------- HELPERS ---------------- */

const formatFindingTime = (date: string) => {
  const timestamp = new Date(date).getTime();

  if (Number.isNaN(timestamp)) {
    return "Unknown";
  }

  const diff = Date.now() - timestamp;

  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hr ago`;
  }

  const days = Math.floor(hours / 24);

  return `${days} day${days > 1 ? "s" : ""} ago`;
};

const formatSyncTime = (date: string) => {
  const timestamp = new Date(date);

  if (Number.isNaN(timestamp.getTime())) {
    return "Unknown";
  }

  return timestamp.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default Dashboard;
