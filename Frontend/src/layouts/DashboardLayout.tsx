import {Bell, ChevronDown,Link2, UserCircle} from "lucide-react";
import { Outlet, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function DashboardLayout() {
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
  const userRole = user?.role || "Administrator";

  return (
    <div className="flex min-h-screen items-stretch bg-[#08070D] text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="flex min-w-0 flex-1 flex-col bg-[#08070D]">
        {/* Top Header */}
        <header className="flex h-20 shrink-0 items-center justify-between border-b border-white/10 bg-[#0B0914] px-8">
          {/* Page Context */}
          <div>
            <h2 className="text-base font-semibold text-white">
              Cloud Security Posture Management
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Monitor and secure your cloud infrastructure
            </p>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-5">


            <Link
  to="/connect"
  className="flex items-center gap-2 rounded-lg bg-[#8B5CF6] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#7C3AED]"
>
  <Link2 size={16} strokeWidth={1.8} />
  Connect AWS
</Link>

            {/* Notification */}
            <button
              type="button"
              aria-label="Notifications"
              className="relative rounded-lg p-2 text-gray-400 transition hover:bg-white/[0.05] hover:text-white"
            >
              <Bell size={19} strokeWidth={1.8} />

              {/* Notification indicator */}
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#8B5CF6]" />
            </button>

            {/* Divider */}
            <div className="h-8 w-px bg-white/10" />

            {/* User */}
            <button
              type="button"
              className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition hover:bg-white/[0.04]"
            >
              <UserCircle
                size={32}
                strokeWidth={1.5}
                className="text-gray-400"
              />

              <div className="hidden text-left sm:block">
                <p className="max-w-[160px] truncate text-sm font-medium text-white">
                  {userName}
                </p>

                <p className="text-[11px] text-gray-500">
                  {userRole}
                </p>
              </div>

              <ChevronDown
                size={15}
                className="text-gray-500"
              />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-0 flex-1 overflow-auto bg-[#08070D] p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;