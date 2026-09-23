import {
  LayoutDashboard,
  Cloud,
  ShieldAlert,
  Gauge,
  Sparkles,
  Wrench,
  FileClock,
  Settings,
  Shield,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const navigation = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "AWS Resources",
    path: "/resources",
    icon: Cloud,
  },
  {
    name: "Security Findings",
    path: "/findings",
    icon: ShieldAlert,
  },
  {
    name: "Security Score",
    path: "/score",
    icon: Gauge,
  },
  {
    name: "AI Assistant",
    path: "/assistant",
    icon: Sparkles,
  },
  {
    name: "Remediation",
    path: "/remediation",
    icon: Wrench,
  },
  {
    name: "Audit Logs",
    path: "/audit-logs",
    icon: FileClock,
  },
];

function Sidebar() {
  return (
    <aside className="flex min-h-screen w-64 shrink-0 flex-col border-r border-white/10 bg-[#0B0914] text-white">
      {/* Logo */}
      <div className="flex h-20 shrink-0 items-center border-b border-white/10 px-6">
        <div className="flex items-center gap-3">
          {/* Logo Icon */}
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8B5CF6] shadow-[0_0_25px_rgba(139,92,246,0.35)]">
            <Shield size={21} strokeWidth={1.8} />
          </div>

          {/* Logo Text */}
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              CloudShield
            </h1>

            <p className="text-xs text-gray-500">
              Cloud Security
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
        {/* Section Label */}
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-600">
          Security
        </p>

        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-[#8B5CF6] text-white shadow-[0_0_20px_rgba(139,92,246,0.18)]"
                    : "text-gray-400 hover:bg-white/[0.04] hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active Indicator */}
                  {isActive && (
                    <span className="absolute left-0 h-6 w-0.5 rounded-full bg-white" />
                  )}

                  <Icon
                    size={19}
                    strokeWidth={1.8}
                    className={`shrink-0 transition-colors ${
                      isActive
                        ? "text-white"
                        : "text-gray-500 group-hover:text-gray-300"
                    }`}
                  />

                  <span>{item.name}</span>

                  {/* AI Indicator */}
                  {item.name === "AI Assistant" && (
                    <span className="ml-auto rounded-md bg-[#C084FC]/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#C084FC]">
                      AI
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="shrink-0 border-t border-white/10 p-3">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ${
              isActive
                ? "bg-[#8B5CF6] text-white shadow-[0_0_20px_rgba(139,92,246,0.18)]"
                : "text-gray-400 hover:bg-white/[0.04] hover:text-white"
            }`
          }
        >
          <Settings
            size={19}
            strokeWidth={1.8}
            className="shrink-0"
          />

          <span>Settings</span>
        </NavLink>

        {/* Security Status */}
        <div className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#22C55E] shadow-[0_0_8px_rgba(34,197,94,0.6)]" />

            <span className="text-[11px] font-medium text-gray-400">
              System Protected
            </span>
          </div>

          <p className="mt-1 pl-4 text-[9px] text-gray-600">
            CloudShield security active
          </p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;