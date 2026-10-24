import { useEffect, useState } from "react";
import { Link2, LogOut, Menu, UserCircle } from "lucide-react";
import { Outlet, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { signOut } from "../services/api";

const formatRole = (role: string) =>
  role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();

function DashboardLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Escape closes the mobile menu.
  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

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
  // No invented fallback: show a role only if the account actually has one.
  const userRole =
    typeof user?.role === "string" && user.role ? formatRole(user.role) : "";

  return (
    <div className="flex min-h-screen items-stretch bg-[#08070D] text-white">
      {/* Mobile menu backdrop */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Main Area */}
      <div className="flex min-w-0 flex-1 flex-col bg-[#08070D]">
        {/* Top Header */}
        <header className="flex h-20 shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-[#0B0914] px-4 sm:px-8">
          {/* Page Context */}
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="rounded-lg p-2 text-gray-300 hover:bg-white/5 hover:text-white lg:hidden"
            >
              <Menu size={22} />
            </button>

            <div className="hidden min-w-0 sm:block">
              <h2 className="truncate text-base font-semibold text-white">
                Cloud Security Posture Management
              </h2>

              <p className="mt-1 truncate text-xs text-gray-500">
                Monitor and secure your cloud infrastructure
              </p>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <Link
              to="/connect"
              aria-label="Connect AWS"
              className="flex items-center gap-2 rounded-lg bg-[#8B5CF6] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#7C3AED] sm:px-4"
            >
              <Link2 size={16} strokeWidth={1.8} />
              <span className="hidden sm:inline">Connect AWS</span>
            </Link>

            {/* Divider */}
            <div className="hidden h-8 w-px bg-white/10 sm:block" />

            {/* User */}
            <Link
              to="/settings"
              aria-label="Account settings"
              className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition hover:bg-white/[0.04]"
            >
              <UserCircle
                size={32}
                strokeWidth={1.5}
                className="text-gray-400"
              />

              <div className="hidden text-left md:block">
                <p className="max-w-[160px] truncate text-sm font-medium text-white">
                  {userName}
                </p>

                {userRole && (
                  <p className="text-[11px] text-gray-500">{userRole}</p>
                )}
              </div>
            </Link>

            {/* Sign out */}
            <button
              type="button"
              onClick={signOut}
              aria-label="Sign out"
              className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-gray-300 transition hover:border-white/20 hover:bg-white/[0.04] hover:text-white"
            >
              <LogOut size={16} strokeWidth={1.8} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-0 flex-1 overflow-auto bg-[#08070D] p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;