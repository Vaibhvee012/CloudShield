import { useState } from "react";
import { Link2, ShieldCheck } from "lucide-react";
import { connectAWS } from "../services/api";
import ConnectHelp from "../components/ConnectHelp";

const REGIONS = [
  { value: "ap-south-1", label: "Asia Pacific (Mumbai) — ap-south-1" },
  { value: "ap-south-2", label: "Asia Pacific (Hyderabad) — ap-south-2" },
  { value: "us-east-1", label: "US East (N. Virginia) — us-east-1" },
  { value: "us-east-2", label: "US East (Ohio) — us-east-2" },
  { value: "us-west-1", label: "US West (N. California) — us-west-1" },
  { value: "us-west-2", label: "US West (Oregon) — us-west-2" },
  { value: "eu-west-1", label: "Europe (Ireland) — eu-west-1" },
  { value: "eu-central-1", label: "Europe (Frankfurt) — eu-central-1" },
];

const Connect = () => {
  const [accountId, setAccountId] = useState("");
  const [roleArn, setRoleArn] = useState("");
  const [region, setRegion] = useState("ap-south-1");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

    const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await connectAWS({ accountId, roleArn, region });

      setSuccess("AWS account connected successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to AWS account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full p-6 lg:p-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
            <Link2 className="h-6 w-6 text-purple-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-500">
            Connect AWS Account
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Connect your AWS account to allow CloudShield to monitor your
            resources and security posture.
          </p>
        </div>

        {/* Connection Card */}
        <div className="rounded-2xl border border-white/10 bg-[#0B0914] p-6 shadow-xl shadow-black/20 sm:p-8">
          <div className="mb-6 flex items-start gap-3 rounded-xl bg-purple-50 p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-purple-600" />

            <div>
              <p className="text-sm font-semibold text-gray-900">
                Secure AWS connection
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-600">
                CloudShield uses your IAM Role ARN to securely access your AWS
                account through temporary AWS credentials. Your permanent AWS
                access keys are not required.
              </p>
            </div>
          </div>

          <form onSubmit={handleConnect} className="space-y-6">
            {/* Account ID */}
            <div>
              <label
                htmlFor="accountId"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                AWS Account ID
              </label>

              <input
                id="accountId"
                type="text"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                placeholder="123456789012"
                maxLength={12}
                required
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none transition focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20"
              />

              <p className="mt-1.5 text-xs text-gray-500">
                Your 12-digit AWS account ID.
              </p>
            </div>

            {/* IAM Role ARN */}
            <div>
              <label
                htmlFor="roleArn"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                IAM Role ARN
              </label>

              <input
                id="roleArn"
                type="text"
                value={roleArn}
                onChange={(e) => setRoleArn(e.target.value)}
                placeholder="arn:aws:iam::123456789012:role/CloudShieldReadOnly"
                required
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none transition focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20"
              />

              <p className="mt-1.5 text-xs text-gray-500">
                The IAM role CloudShield will assume to monitor your AWS
                resources.
              </p>
            </div>

            {/* Region */}
            <div>
              <label
                htmlFor="region"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                AWS Region
              </label>

              <select
                id="region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#0B0914] px-4 py-3 text-sm text-white outline-none transition focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20"
              >
                {REGIONS.map((r) => (
                  <option
                    key={r.value}
                    value={r.value}
                    className="bg-[#0B0914] text-white"
                  >
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
                {success}
              </div>
            )}

            {/* Connect */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Link2 className="h-4 w-4" />
              {loading ? "Connecting..." : "Connect AWS"}
            </button>
          </form>

          {/* Help link + step-by-step pop-up (outside the form) */}
          <ConnectHelp />
        </div>
      </div>
    </div>
  );
};

export default Connect;