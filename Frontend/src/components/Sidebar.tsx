import { useEffect, useState } from "react";
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
  X,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import type { ConnectionState } from "../hooks/useApiData";
import { getSecurityPosture } from "../services/api";

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

type SidebarStatus =
  | { state: ConnectionState; totalFindings: number }
  | "error"
  | null;

function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { pathname } = useLocation();
  const [status, setStatus] = useState<SidebarStatus>(null);

  // Re-check when you move between pages, so the card never goes stale.
  useEffect(() => {
    let active = true;

    getSecurityPosture()
      .then((response) => {
        if (!active) return;

        setStatus({
          state: response?.data?.state ?? "NOT_CONNECTED",
          totalFindings: response?.data?.totalFindings ?? 0,
        });
      })
      .catch(() => {
        if (active) setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [pathname]);

  const statusView = (() => {
    if (status === null) {
      return {
        dot: "bg-gray-600",
        title: "Checking status...",
        detail: "",
      };
    }

    if (status === "error") {
      return {
        dot: "bg-gray-600",
        title: "Status unavailable",
        detail: "Could not reach CloudShield",
      };
    }

    if (status.state === "NOT_CONNECTED") {
      return {
        dot: "bg-gray-500",
        title: "No AWS account connected",
        detail: "Connect one to start scanning",
      };
    }

    if (status.state === "NO_DATA") {
      return {
        dot: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]",
        title: "AWS account connected",
        detail: "Waiting for your first scan",
      };
    }

    return {
      dot: "bg-[#22C55E] shadow-[0_0_8px_rgba(34,197,94,0.6)]",
      title: "AWS account connected",
      detail:
        status.totalFindings === 0
          ? "No open findings"
          : `${status.totalFindings} open finding${
              status.totalFindings === 1 ? "" : "s"
            }`,
    };
  })();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col border-r border-white/10 bg-[#0B0914] text-white transition-transform duration-200 lg:static lg:min-h-screen lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Logo */}
      <div className="flex h-20 shrink-0 items-center justify-between border-b border-white/10 px-6">
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

        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white lg:hidden"
        >
          <X size={18} />
        </button>
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
              onClick={onClose}
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
          onClick={onClose}
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

        {/* Connection status: reflects the real state of your account */}
        <div className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-3">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 shrink-0 rounded-full ${statusView.dot}`} />

            <span className="text-[11px] font-medium text-gray-400">
              {statusView.title}
            </span>
          </div>

          {statusView.detail && (
            <p className="mt-1 pl-4 text-[9px] text-gray-600">
              {statusView.detail}
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;