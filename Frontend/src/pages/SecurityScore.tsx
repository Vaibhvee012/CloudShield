import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Gauge,
  Shield,
  ShieldAlert,
} from "lucide-react";

import { getSecurityPosture } from "../services/api";

interface SecurityData {
  score: number;
  totalFindings: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  resourcesTotal: number;
  healthyResources: number;
  healthPercentage: number;
}

function SecurityScore() {
  const [data, setData] = useState<SecurityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSecurityScore = async () => {
      try {
        const response = await getSecurityPosture();

        const securityData = response.data ?? response;

        setData(securityData);
      } catch (error) {
        setError("Failed to load security score");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSecurityScore();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#8B5CF6] border-t-transparent" />

          <p className="mt-4 text-sm text-gray-500">
            Calculating security score...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-[#EF4444]/20 bg-[#0B0914] p-6">
        <div className="flex items-center gap-3">
          <AlertTriangle
            size={20}
            className="text-[#EF4444]"
          />

          <div>
            <h2 className="font-semibold text-white">
              Unable to load security score
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {error || "Security data is unavailable."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const score = Math.min(
    100,
    Math.max(0, Number(data.score) || 0)
  );

  const healthPercentage = Math.min(
    100,
    Math.max(0, Number(data.healthPercentage) || 0)
  );

  const scoreStatus =
    score >= 80
      ? "Strong"
      : score >= 60
        ? "Good"
        : score >= 40
          ? "Needs Attention"
          : "Critical";

  const scoreDescription =
    score >= 80
      ? "Your cloud environment has a strong security posture."
      : score >= 60
        ? "Your cloud environment is reasonably protected, but improvements are recommended."
        : score >= 40
          ? "Your environment has security issues that should be addressed."
          : "Your environment requires immediate security attention.";

  const circumference = 2 * Math.PI * 92;

  const dashOffset =
    circumference - (score / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8B5CF6]/10">
              <Gauge
                size={21}
                className="text-[#A78BFA]"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Security Score
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Measure the overall security posture of your cloud environment
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0B0914] px-4 py-3">
          <p className="text-xs text-gray-500">
            Resources Analyzed
          </p>

          <p className="mt-1 text-xl font-bold text-white">
            {data.resourcesTotal}
          </p>
        </div>
      </div>

      {/* Score + Overview */}
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Score Card */}
        <div className="rounded-2xl border border-white/10 bg-[#0B0914] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-white">
                Overall Security Score
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Based on your current security posture
              </p>
            </div>

            <Shield
              size={20}
              className="text-[#A78BFA]"
            />
          </div>

          <div className="flex flex-col items-center justify-center py-10">
            <div className="relative h-56 w-56">
              <svg
                className="h-full w-full -rotate-90"
                viewBox="0 0 220 220"
              >
                <circle
                  cx="110"
                  cy="110"
                  r="92"
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="14"
                />

                <circle
                  cx="110"
                  cy="110"
                  r="92"
                  fill="none"
                  stroke="#8B5CF6"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  className="transition-all duration-1000"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold text-white">
                  {score}
                </span>

                <span className="mt-1 text-xs uppercase tracking-widest text-gray-500">
                  / 100
                </span>
              </div>
            </div>

            <div className="mt-2 rounded-full bg-[#8B5CF6]/10 px-4 py-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#A78BFA]">
                {scoreStatus}
              </span>
            </div>

            <p className="mt-4 max-w-md text-center text-sm leading-6 text-gray-500">
              {scoreDescription}
            </p>
          </div>
        </div>

        {/* Environment Health */}
        <div className="rounded-2xl border border-white/10 bg-[#0B0914] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-white">
                Environment Health
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Resource health across your environment
              </p>
            </div>

            <CheckCircle2
              size={20}
              className="text-[#22C55E]"
            />
          </div>

          <div className="mt-8">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-4xl font-bold text-white">
                  {healthPercentage}%
                </span>

                <p className="mt-1 text-xs text-gray-500">
                  Healthy resources
                </p>
              </div>

              <span className="text-sm text-gray-400">
                {data.healthyResources}/{data.resourcesTotal}
              </span>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-[#22C55E] transition-all duration-700"
                style={{
                  width: `${healthPercentage}%`,
                }}
              />
            </div>
          </div>

          <div className="mt-10 space-y-4">
            <HealthRow
              label="Healthy Resources"
              value={data.healthyResources}
              icon={<CheckCircle2 size={17} />}
              iconClass="text-[#22C55E]"
            />

            <HealthRow
              label="Resources Analyzed"
              value={data.resourcesTotal}
              icon={<Shield size={17} />}
              iconClass="text-[#A78BFA]"
            />

            <HealthRow
              label="Total Findings"
              value={data.totalFindings}
              icon={<ShieldAlert size={17} />}
              iconClass="text-[#F59E0B]"
            />
          </div>
        </div>
      </div>

      {/* Findings Breakdown */}
      <div className="rounded-2xl border border-white/10 bg-[#0B0914] p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-white">
              Security Findings Breakdown
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Findings grouped by severity
            </p>
          </div>

          <AlertTriangle
            size={20}
            className="text-[#F59E0B]"
          />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SeverityCard
            label="Critical"
            count={data.critical}
            color="#EF4444"
            description="Immediate attention"
          />

          <SeverityCard
            label="High"
            count={data.high}
            color="#F59E0B"
            description="High priority"
          />

          <SeverityCard
            label="Medium"
            count={data.medium}
            color="#EAB308"
            description="Review recommended"
          />

          <SeverityCard
            label="Low"
            count={data.low}
            color="#22C55E"
            description="Low priority"
          />
        </div>
      </div>

      {/* Score Guide */}
      <div className="rounded-2xl border border-white/10 bg-[#0B0914] p-6">
        <h2 className="font-semibold text-white">
          Score Guide
        </h2>

        <p className="mt-1 text-xs text-gray-500">
          Understand how to interpret your security posture score
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ScoreGuide
            range="80 – 100"
            label="Strong"
            color="#22C55E"
          />

          <ScoreGuide
            range="60 – 79"
            label="Good"
            color="#A78BFA"
          />

          <ScoreGuide
            range="40 – 59"
            label="Needs Attention"
            color="#F59E0B"
          />

          <ScoreGuide
            range="0 – 39"
            label="Critical"
            color="#EF4444"
          />
        </div>
      </div>
    </div>
  );
}

function HealthRow({
  label,
  value,
  icon,
  iconClass,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
      <div className="flex items-center gap-3">
        <span className={iconClass}>
          {icon}
        </span>

        <span className="text-sm text-gray-400">
          {label}
        </span>
      </div>

      <span className="text-sm font-semibold text-white">
        {value}
      </span>
    </div>
  );
}

function SeverityCard({
  label,
  count,
  color,
  description,
}: {
  label: string;
  count: number;
  color: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
          {label}
        </span>

        <span
          className="h-2 w-2 rounded-full"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}`,
          }}
        />
      </div>

      <p className="mt-4 text-3xl font-bold text-white">
        {count}
      </p>

      <p className="mt-1 text-xs text-gray-600">
        {description}
      </p>
    </div>
  );
}

function ScoreGuide({
  range,
  label,
  color,
}: {
  range: string;
  label: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{
          backgroundColor: color,
          boxShadow: `0 0 8px ${color}`,
        }}
      />

      <div>
        <p className="text-xs font-semibold text-white">
          {label}
        </p>

        <p className="mt-0.5 text-[11px] text-gray-600">
          {range}
        </p>
      </div>
    </div>
  );
}

export default SecurityScore;