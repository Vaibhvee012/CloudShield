import {
  LayoutDashboard,
  Cloud,
  ShieldAlert,
  Gauge,
  Sparkles,
  Wrench,
  FileClock,
  Settings,
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
    <aside className="flex h-screen w-64 flex-col bg-[#111827] text-white">
      {/* Logo */}
      <div className="flex h-20 items-center border-b border-white/10 px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8B5CF6]">
            <ShieldAlert size={22} />
          </div>

          <div>
            <h1 className="text-lg font-bold">CloudShield</h1>
            <p className="text-xs text-gray-400">Cloud Security</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-6">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-[#8B5CF6] text-white"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Icon size={19} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="border-t border-white/10 p-3">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
              isActive
                ? "bg-[#8B5CF6] text-white"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`
          }
        >
          <Settings size={19} />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
}

export default Sidebar;