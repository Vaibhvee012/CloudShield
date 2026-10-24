import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Cloud,
  KeyRound,
  Lock,
  Palette,
  Settings as SettingsIcon,
  Shield,
  User,
} from "lucide-react";

import { useApiData } from "../hooks/useApiData";
import { getAWSConnections } from "../services/api";

interface AWSConnectionRow {
  id: string;
  accountId: string;
  region: string;
  status: string;
  lastSyncAt: string | null;
}

const formatRole = (role: string) =>
  role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();

const formatDate = (iso: string) => {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) return "Unknown";

  return date.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

function Settings() {
  const storedUser = localStorage.getItem("cloudshield_user");

  let user = null;

  if (storedUser) {
    try {
      user = JSON.parse(storedUser);
    } catch {
      user = null;
    }
  }

  const userName = user?.name || "Not available";
  const userEmail = user?.email || "Not available";
  const userRole =
    typeof user?.role === "string" && user.role
      ? formatRole(user.role)
      : "Not available";

  const {
    data: connections,
    loading: connectionsLoading,
    error: connectionsError,
    reload: reloadConnections,
  } = useApiData<AWSConnectionRow[]>(
    getAWSConnections,
    "Failed to load AWS connections"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8B5CF6]/10">
            <SettingsIcon size={21} className="text-[#A78BFA]" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Settings
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Your CloudShield account and connections.
            </p>
          </div>
        </div>
      </div>

      {/* Account */}
      <section className="rounded-2xl border border-white/10 bg-[#0B0914]">
        <div className="border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <User size={18} className="text-[#A78BFA]" />

            <div>
              <h2 className="text-sm font-semibold text-white">Account</h2>

              <p className="mt-1 text-xs text-gray-600">
                The account you are signed in with.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-6 md:grid-cols-2">
          <SettingField label="Name" value={userName} />

          <SettingField label="Email" value={userEmail} />

          <SettingField label="Role" value={userRole} />

          <SettingField label="Sign-in method" value="Email and password" />
        </div>
      </section>

      {/* AWS connections */}
      <section className="rounded-2xl border border-white/10 bg-[#0B0914]">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <Cloud size={18} className="text-[#A78BFA]" />

            <div>
              <h2 className="text-sm font-semibold text-white">
                AWS connections
              </h2>

              <p className="mt-1 text-xs text-gray-600">
                AWS accounts CloudShield can read from.
              </p>
            </div>
          </div>

          <Link
            to="/connect"
            className="shrink-0 rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-300 transition hover:border-[#8B5CF6]/30 hover:text-white"
          >
            Connect an account
          </Link>
        </div>

        {connectionsLoading ? (
          <p className="px-6 py-8 text-sm text-gray-500">
            Loading connections...
          </p>
        ) : connectionsError ? (
          <div className="px-6 py-6">
            <p className="text-sm text-red-300">{connectionsError}</p>

            <button
              type="button"
              onClick={reloadConnections}
              className="mt-3 rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-300 hover:border-[#8B5CF6]/30 hover:text-white"
            >
              Try again
            </button>
          </div>
        ) : !connections || connections.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <Cloud size={30} className="mx-auto text-gray-600" />

            <p className="mt-3 text-sm text-gray-300">
              No AWS account connected
            </p>

            <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-gray-600">
              Connect an AWS account to start scanning your environment.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {connections.map((connection) => (
              <div
                key={connection.id}
                className="flex flex-col gap-2 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-white">
                      Account {connection.accountId}
                    </p>

                    <span
                      className={`rounded-lg px-2.5 py-1 text-[10px] font-semibold uppercase ${
                        connection.status === "CONNECTED"
                          ? "bg-[#22C55E]/10 text-[#22C55E]"
                          : "bg-white/5 text-gray-400"
                      }`}
                    >
                      {connection.status.toLowerCase()}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-gray-600">
                    Region {connection.region}
                  </p>
                </div>

                <p className="text-xs text-gray-500">
                  {connection.lastSyncAt
                    ? `Last scan ${formatDate(connection.lastSyncAt)}`
                    : "Not scanned yet"}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Security */}
      <section className="rounded-2xl border border-white/10 bg-[#0B0914]">
        <div className="border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <Shield size={18} className="text-[#A78BFA]" />

            <div>
              <h2 className="text-sm font-semibold text-white">Security</h2>

              <p className="mt-1 text-xs text-gray-600">
                How your account is protected.
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-white/5">
          <SettingRow
            icon={<Lock size={17} />}
            title="Password"
            description="Changing your password from within CloudShield is not available yet."
            status="Not available yet"
          />

          <SettingRow
            icon={<KeyRound size={17} />}
            title="Sessions"
            description="You stay signed in for up to 24 hours, then you are asked to sign in again."
            status="24 hour sessions"
          />
        </div>
      </section>

      {/* Notifications */}
      <section className="rounded-2xl border border-white/10 bg-[#0B0914]">
        <div className="border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <Bell size={18} className="text-[#A78BFA]" />

            <div>
              <h2 className="text-sm font-semibold text-white">
                Notifications
              </h2>

              <p className="mt-1 text-xs text-gray-600">
                How CloudShield keeps you informed.
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm text-gray-300">
            Email and in-app alerts are not available yet.
          </p>

          <p className="mt-1 text-xs leading-5 text-gray-600">
            In the meantime, sign-ins, scans, AI requests and blocked access
            attempts are recorded in your{" "}
            <Link
              to="/audit-logs"
              className="text-[#A78BFA] hover:text-[#C4B5FD]"
            >
              Audit Logs
            </Link>
            , and new findings appear on your Dashboard after each scan.
          </p>
        </div>
      </section>

      {/* Appearance */}
      <section className="rounded-2xl border border-white/10 bg-[#0B0914]">
        <div className="border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <Palette size={18} className="text-[#A78BFA]" />

            <div>
              <h2 className="text-sm font-semibold text-white">
                Appearance
              </h2>

              <p className="mt-1 text-xs text-gray-600">
                The CloudShield interface.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-6">
          <div>
            <p className="text-sm font-medium text-white">Theme</p>

            <p className="mt-1 text-xs text-gray-600">
              CloudShield currently has one theme.
            </p>
          </div>

          <div className="rounded-lg border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-4 py-2 text-xs font-medium text-[#A78BFA]">
            Midnight
          </div>
        </div>
      </section>
    </div>
  );
}

function SettingField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500">{label}</p>

      <div className="mt-2 truncate rounded-lg border border-white/10 bg-white/[0.025] px-4 py-3 text-sm text-gray-300">
        {value}
      </div>
    </div>
  );
}

function SettingRow({
  icon,
  title,
  description,
  status,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  status: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-6 py-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-gray-400">
          {icon}
        </div>

        <div>
          <p className="text-sm font-medium text-white">{title}</p>

          <p className="mt-1 text-xs text-gray-600">{description}</p>
        </div>
      </div>

      <span className="shrink-0 rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-500">
        {status}
      </span>
    </div>
  );
}

export default Settings;