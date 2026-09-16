import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  ChevronRight,
  Cloud,
  Database,
  Globe2,
  Lock,
  Network,
  RefreshCw,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getSecurityPosture } from "../services/api";

type SecurityData = {
  score: number;
  totalFindings: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  resourcesTotal: number;
  healthyResources: number;
  healthPercentage: number;
};

const postureData = [
  { day: "01", score: 42 },
  { day: "05", score: 45 },
  { day: "09", score: 44 },
  { day: "13", score: 49 },
  { day: "17", score: 47 },
  { day: "21", score: 52 },
  { day: "25", score: 50 },
  { day: "30", score: 55 },
];

const findings = [
  {
    title: "Public S3 bucket detected",
    resource: "production-assets",
    severity: "Critical",
    time: "2 min ago",
  },
  {
    title: "Over-permissive IAM policy",
    resource: "deployment-role",
    severity: "High",
    time: "8 min ago",
  },
  {
    title: "Security group allows SSH",
    resource: "api-server-sg",
    severity: "High",
    time: "14 min ago",
  },
];

const activity = [
  {
    icon: ShieldCheck,
    title: "Security scan completed",
    description: "42 resources analyzed",
    time: "2 min ago",
  },
  {
    icon: AlertTriangle,
    title: "Critical finding detected",
    description: "production-assets",
    time: "4 min ago",
  },
  {
    icon: CheckCircle2,
    title: "Remediation completed",
    description: "IAM policy updated",
    time: "11 min ago",
  },
  {
    icon: Bot,
    title: "AI security analysis",
    description: "3 recommendations generated",
    time: "18 min ago",
  },
];

const Dashboard = () => {
  const [security, setSecurity] = useState<SecurityData>({
    score: 55,
    totalFindings: 4,
    critical: 1,
    high: 2,
    medium: 1,
    low: 0,
    resourcesTotal: 5,
    healthyResources: 2,
    healthPercentage: 40,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSecurity = async () => {
      try {
        const response = await getSecurityPosture();

        const data = response?.data ?? response;

        setSecurity({
          score: data.score ?? 55,
          totalFindings: data.totalFindings ?? 4,
          critical: data.critical ?? 1,
          high: data.high ?? 2,
          medium: data.medium ?? 1,
          low: data.low ?? 0,
          resourcesTotal: data.resourcesTotal ?? 5,
          healthyResources: data.healthyResources ?? 2,
          healthPercentage: data.healthPercentage ?? 40,
        });
      } catch (error) {
        console.error("Failed to load security posture:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSecurity();
  }, []);

  const score = security.score;

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
              <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-300">
                Security systems operational
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight lg:text-4xl">
              Security Command Center
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Real-time visibility across your cloud infrastructure.
            </p>
          </div>

          <div className="flex items-center gap-3">

            <div className="hidden rounded-xl border border-white/10 bg-white/[0.035] px-4 py-2.5 sm:block">
              <p className="text-[9px] uppercase tracking-wider text-slate-600">
                Last security scan
              </p>
              <p className="mt-0.5 text-xs text-slate-300">
                Today, 10:42 PM
              </p>
            </div>

            <button className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-4 py-3 text-sm font-medium shadow-lg shadow-purple-900/20 transition hover:brightness-110">
              <RefreshCw className="h-4 w-4 transition group-hover:rotate-180" />
              Run scan
            </button>
          </div>
        </div>

        {/* Main Security Posture */}
        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">

          {/* Security score */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045] p-7 shadow-2xl shadow-black/20">

            <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-purple-600/10 blur-[90px]" />

            <div className="relative flex h-full flex-col justify-between">

              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-purple-300" />
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-300">
                      Overall security posture
                    </span>
                  </div>

                  <h2 className="mt-3 text-2xl font-semibold">
                    Your environment needs attention
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                    CloudShield detected several security issues across your
                    cloud environment that should be reviewed.
                  </p>
                </div>

                <div className="hidden rounded-xl border border-purple-400/20 bg-purple-500/10 px-3 py-2 sm:block">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5 text-purple-300" />
                    <span className="text-xs text-purple-200">
                      +8% this month
                    </span>
                  </div>
                </div>
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
                      {loading ? "--" : score}
                    </p>

                    <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-slate-500">
                      Security score
                    </p>

                    <div className="mx-auto mt-3 flex w-fit items-center gap-1.5 rounded-full bg-amber-400/10 px-2.5 py-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      <span className="text-[10px] font-medium text-amber-300">
                        Needs attention
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score breakdown */}
                <div className="space-y-5">

                  <div>
                    <div className="mb-2 flex justify-between">
                      <span className="text-xs text-slate-400">
                        Environment health
                      </span>
                      <span className="text-xs font-semibold text-white">
                        {security.healthPercentage}%
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-600 to-violet-400"
                        style={{
                          width: `${security.healthPercentage}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">

                    <PostureStat
                      label="Critical"
                      value={security.critical}
                      icon={<ShieldAlert className="h-4 w-4" />}
                      type="critical"
                    />

                    <PostureStat
                      label="High risk"
                      value={security.high}
                      icon={<AlertTriangle className="h-4 w-4" />}
                      type="high"
                    />

                    <PostureStat
                      label="Medium"
                      value={security.medium}
                      icon={<Activity className="h-4 w-4" />}
                      type="medium"
                    />

                    <PostureStat
                      label="Resources"
                      value={security.resourcesTotal}
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
                    Protected environment
                  </h3>
                </div>

                <Cloud className="h-5 w-5 text-purple-300" />
              </div>

              {/* Cloud map */}
              <div className="relative mt-6 h-[250px] overflow-hidden rounded-2xl border border-white/5 bg-[#090811]">

                <div className="absolute inset-0 opacity-20">
                  <div className="absolute left-1/2 top-1/2 h-px w-full -translate-x-1/2 bg-purple-500" />
                  <div className="absolute left-1/2 top-1/2 h-full w-px -translate-y-1/2 bg-purple-500" />
                </div>

                {/* Connection lines */}
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
                  label="Storage"
                  status="healthy"
                />

                <InfrastructureNode
                  className="right-[10%] top-[24%]"
                  icon={<Server className="h-4 w-4" />}
                  label="Compute"
                  status="warning"
                />

                <InfrastructureNode
                  className="bottom-[12%] left-[12%]"
                  icon={<Network className="h-4 w-4" />}
                  label="Network"
                  status="healthy"
                />

                <InfrastructureNode
                  className="bottom-[12%] right-[12%]"
                  icon={<Globe2 className="h-4 w-4" />}
                  label="Internet"
                  status="warning"
                />
              </div>

              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  {security.resourcesTotal} resources monitored
                </span>

                <button className="flex items-center gap-1 text-purple-300 hover:text-purple-200">
                  Explore cloud map
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <MetricCard
            icon={<ShieldAlert />}
            label="Security findings"
            value={security.totalFindings}
            detail="Requires review"
            trend="+2"
            tone="purple"
          />

          <MetricCard
            icon={<AlertTriangle />}
            label="Critical threats"
            value={security.critical}
            detail="Immediate action"
            trend="Active"
            tone="red"
          />

          <MetricCard
            icon={<Cloud />}
            label="Cloud resources"
            value={security.resourcesTotal}
            detail={`${security.healthyResources} healthy`}
            trend="Monitored"
            tone="blue"
          />

          <MetricCard
            icon={<Zap />}
            label="Auto remediation"
            value="04"
            detail="Actions available"
            trend="+12%"
            tone="green"
          />
        </div>

        {/* Analytics */}
        <div className="grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">

          {/* Chart */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-6">

            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-purple-300" />
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Security telemetry
                  </span>
                </div>

                <div className="mt-2 flex items-end gap-3">
                  <h3 className="text-2xl font-semibold">
                    Posture trend
                  </h3>

                  <span className="mb-1 flex items-center gap-1 text-xs text-emerald-400">
                    <TrendingUp className="h-3 w-3" />
                    +13%
                  </span>
                </div>

                <p className="mt-1 text-xs text-slate-600">
                  Security score over the last 30 days
                </p>
              </div>

              <button className="rounded-lg border border-white/10 px-3 py-2 text-[10px] text-slate-400 hover:bg-white/5">
                Last 30 days
              </button>
            </div>

            <div className="mt-6 h-[270px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={postureData}>
                  <defs>
                    <linearGradient
                      id="purpleArea"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#8B5CF6"
                        stopOpacity={0.35}
                      />
                      <stop
                        offset="100%"
                        stopColor="#8B5CF6"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#475569",
                      fontSize: 10,
                    }}
                  />

                  <YAxis
                    domain={[30, 70]}
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#475569",
                      fontSize: 10,
                    }}
                  />

                  <Tooltip
                    contentStyle={{
                      background: "#111019",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                    labelStyle={{
                      color: "#94a3b8",
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#A78BFA"
                    strokeWidth={3}
                    fill="url(#purpleArea)"
                    dot={false}
                    activeDot={{
                      r: 5,
                      fill: "#8B5CF6",
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
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

              <button className="text-xs text-purple-300 hover:text-purple-200">
                View all
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {findings.map((finding) => (
                <FindingCard
                  key={finding.title}
                  title={finding.title}
                  resource={finding.resource}
                  severity={finding.severity}
                  time={finding.time}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
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

              <p className="mt-5 text-sm leading-6 text-slate-400">
                CloudShield AI identified{" "}
                <span className="font-medium text-white">
                  3 security improvements
                </span>{" "}
                that could increase your posture score.
              </p>

              <div className="mt-5 flex items-center gap-3">
                <button className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-semibold shadow-lg shadow-purple-900/20 hover:bg-purple-500">
                  <Bot className="h-4 w-4" />
                  Ask CloudShield AI
                </button>

                <button className="text-xs text-slate-400 hover:text-white">
                  View insights
                </button>
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
                    Live telemetry
                  </span>
                </div>

                <h3 className="mt-2 text-xl font-semibold">
                  Security activity
                </h3>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-emerald-400">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                LIVE
              </div>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {activity.map((item) => (
                <div
                  key={item.title}
                  className="group flex items-center gap-3 rounded-xl border border-white/5 bg-black/10 p-3 transition hover:border-purple-400/20 hover:bg-purple-500/[0.04]"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5">
                    <item.icon className="h-4 w-4 text-purple-300" />
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
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col justify-between gap-3 border-t border-white/5 pt-5 text-[10px] text-slate-600 sm:flex-row">
          <span>
            CloudShield Security Platform · Demo Environment
          </span>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Lock className="h-3 w-3" />
              Protected connection
            </span>

            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              Systems healthy
            </span>
          </div>
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
    critical: "text-red-400 bg-red-500/10 border-red-500/10",
    high: "text-orange-400 bg-orange-500/10 border-orange-500/10",
    medium: "text-amber-400 bg-amber-500/10 border-amber-500/10",
    normal: "text-purple-300 bg-purple-500/10 border-purple-500/10",
  };

  return (
    <div className="rounded-xl border border-white/5 bg-black/10 p-3">
      <div className="flex items-center justify-between">
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-lg ${styles[type]}`}
        >
          {icon}
        </div>

        <span className="text-lg font-semibold">{value}</span>
      </div>

      <p className="mt-2 text-[10px] text-slate-500">{label}</p>
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
    purple: "bg-purple-500/10 text-purple-300",
    red: "bg-red-500/10 text-red-400",
    blue: "bg-blue-500/10 text-blue-400",
    green: "bg-emerald-500/10 text-emerald-400",
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
        <div className="text-slate-400">{icon}</div>

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
  const severityStyle =
    severity === "Critical"
      ? "text-red-400 bg-red-500/10 border-red-500/10"
      : "text-orange-400 bg-orange-500/10 border-orange-500/10";

  return (
    <div className="group rounded-xl border border-white/5 bg-black/10 p-4 transition hover:border-purple-400/20 hover:bg-purple-500/[0.03]">

      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
            severity === "Critical"
              ? "bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.8)]"
              : "bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.6)]"
          }`}
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
            <span className="text-[10px] text-slate-600">
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

export default Dashboard;
