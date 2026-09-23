import {
  Bell,
  KeyRound,
  Lock,
  Palette,
  Save,
  Settings as SettingsIcon,
  Shield,
  User,
} from "lucide-react";

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

  const userName = user?.name || "CloudShield User";
  const userEmail = user?.email || "Not available";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8B5CF6]/10">
            <SettingsIcon
              size={21}
              className="text-[#A78BFA]"
            />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Settings
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage your CloudShield account and preferences.
            </p>
          </div>
        </div>
      </div>

      {/* Account */}
      <section className="rounded-2xl border border-white/10 bg-[#0B0914]">
        <div className="border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <User
              size={18}
              className="text-[#A78BFA]"
            />

            <div>
              <h2 className="text-sm font-semibold text-white">
                Account
              </h2>

              <p className="mt-1 text-xs text-gray-600">
                Your CloudShield account information.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-6 md:grid-cols-2">
          <SettingField
            label="Name"
            value={userName}
          />

          <SettingField
            label="Email"
            value={userEmail}
          />

          <SettingField
            label="Role"
            value={user?.role || "Administrator"}
          />

          <SettingField
            label="Account Status"
            value="Active"
          />
        </div>
      </section>

      {/* Security */}
      <section className="rounded-2xl border border-white/10 bg-[#0B0914]">
        <div className="border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <Shield
              size={18}
              className="text-[#A78BFA]"
            />

            <div>
              <h2 className="text-sm font-semibold text-white">
                Security
              </h2>

              <p className="mt-1 text-xs text-gray-600">
                Manage account security settings.
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-white/5">
          <SettingRow
            icon={<Lock size={17} />}
            title="Password"
            description="Change your account password."
            action="Change"
          />

          <SettingRow
            icon={<KeyRound size={17} />}
            title="Authentication"
            description="JWT-based authentication is enabled."
            action="Enabled"
          />
        </div>
      </section>

      {/* Notifications */}
      <section className="rounded-2xl border border-white/10 bg-[#0B0914]">
        <div className="border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <Bell
              size={18}
              className="text-[#A78BFA]"
            />

            <div>
              <h2 className="text-sm font-semibold text-white">
                Notifications
              </h2>

              <p className="mt-1 text-xs text-gray-600">
                Configure security notification preferences.
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-white/5">
          <ToggleRow
            title="Security Alerts"
            description="Receive alerts for critical security findings."
            enabled
          />

          <ToggleRow
            title="Remediation Updates"
            description="Receive updates when remediation actions change."
            enabled
          />
        </div>
      </section>

      {/* Appearance */}
      <section className="rounded-2xl border border-white/10 bg-[#0B0914]">
        <div className="border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <Palette
              size={18}
              className="text-[#A78BFA]"
            />

            <div>
              <h2 className="text-sm font-semibold text-white">
                Appearance
              </h2>

              <p className="mt-1 text-xs text-gray-600">
                Customize the CloudShield interface.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-6">
          <div>
            <p className="text-sm font-medium text-white">
              Theme
            </p>

            <p className="mt-1 text-xs text-gray-600">
              CloudShield is currently using the Midnight theme.
            </p>
          </div>

          <div className="rounded-lg border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-4 py-2 text-xs font-medium text-[#A78BFA]">
            Midnight
          </div>
        </div>
      </section>

      {/* Save */}
      <div className="flex justify-end">
        <button
          type="button"
          disabled
          className="flex items-center gap-2 rounded-lg bg-[#8B5CF6] px-5 py-2.5 text-sm font-medium text-white opacity-50"
          title="Settings API not connected yet"
        >
          <Save size={16} />
          Save Changes
        </button>
      </div>
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
      <label className="text-xs font-medium text-gray-500">
        {label}
      </label>

      <div className="mt-2 rounded-lg border border-white/10 bg-white/[0.025] px-4 py-3 text-sm text-gray-300">
        {value}
      </div>
    </div>
  );
}

function SettingRow({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-6 py-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04] text-gray-400">
          {icon}
        </div>

        <div>
          <p className="text-sm font-medium text-white">
            {title}
          </p>

          <p className="mt-1 text-xs text-gray-600">
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        disabled
        className="rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-500"
      >
        {action}
      </button>
    </div>
  );
}

function ToggleRow({
  title,
  description,
  enabled,
}: {
  title: string;
  description: string;
  enabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-6 py-5">
      <div>
        <p className="text-sm font-medium text-white">
          {title}
        </p>

        <p className="mt-1 text-xs text-gray-600">
          {description}
        </p>
      </div>

      <div
        className={`relative h-6 w-11 rounded-full ${
          enabled ? "bg-[#8B5CF6]" : "bg-white/10"
        }`}
      >
        <div
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            enabled ? "left-6" : "left-1"
          }`}
        />
      </div>
    </div>
  );
}

export default Settings;