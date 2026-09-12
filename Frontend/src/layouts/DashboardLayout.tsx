import { Bell, UserCircle } from "lucide-react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Header */}
        <header className="flex h-20 items-center justify-between border-b border-gray-200 bg-white px-8">
          <div>
            <h2 className="text-lg font-semibold text-[#111827]">
              Cloud Security Posture Management
            </h2>
            <p className="text-sm text-gray-500">
              Monitor and secure your cloud infrastructure
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
              aria-label="Notifications"
            >
              <Bell size={20} />
            </button>

            <div className="flex items-center gap-2">
              <UserCircle size={32} className="text-gray-500" />

              <div className="hidden sm:block">
                <p className="text-sm font-medium text-[#111827]">
                  CloudShield User
                </p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;