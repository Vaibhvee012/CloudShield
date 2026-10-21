import { Link, NavLink } from "react-router-dom";
import { signOut } from "../services/api";

const ShieldIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#fff"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6l7-3z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const ArrowIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const linkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? "active" : undefined;

export default function PublicNav() {
  // Presence check only. The API still validates the token on every request.
  const isLoggedIn = Boolean(localStorage.getItem("cloudshield_token"));

  return (
    <header className="pn">
      <style>{css}</style>

      <div className="pn-in">
        <div className="pn-l">
          <Link to="/" className="pn-logo" aria-label="CloudShield home">
            <span className="pn-mark">
              <ShieldIcon />
            </span>
            <span className="pn-brand">CloudShield</span>
          </Link>

          <nav className="pn-links" aria-label="Main">
            <NavLink to="/platform" className={linkClass}>
              Platform
            </NavLink>
            <NavLink to="/security" className={linkClass}>
              Security
            </NavLink>
            <NavLink to="/docs" className={linkClass}>
              Documentation
            </NavLink>
          </nav>
        </div>

        <div className="pn-r">
          {isLoggedIn ? (
            <>
              <button
                type="button"
                onClick={signOut}
                className="pn-btn outline"
              >
                Sign out
              </button>
              <Link to="/dashboard" className="pn-btn primary">
                Dashboard <ArrowIcon />
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="pn-btn outline">
                Sign in
              </Link>
              <Link to="/register" className="pn-btn primary">
                Get started <ArrowIcon />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
.pn{position:relative;z-index:5;height:71px;border-bottom:1px solid rgba(255,255,255,.06);
  background:rgba(8,5,20,.55);backdrop-filter:blur(10px);color:#fff;
  font-family:'Inter',system-ui,sans-serif}
.pn *{box-sizing:border-box}
.pn-in{max-width:1360px;margin:0 auto;height:100%;display:flex;align-items:center;
  justify-content:space-between;padding:0 16px}
.pn-l,.pn-r{display:flex;align-items:center}
.pn-r{gap:14px}
.pn-logo{display:flex;align-items:center;color:#fff;text-decoration:none}
.pn-mark{width:44px;height:44px;border-radius:12px;display:grid;place-items:center;
  background:linear-gradient(135deg,#8b5cf6,#6d3ff0);box-shadow:0 0 22px rgba(139,92,246,.55)}
.pn-brand{margin-left:14px;font-size:21px;font-weight:600;letter-spacing:-.2px}
.pn-links{display:flex;gap:48px;margin-left:82px}
.pn-links a{font-size:15px;color:#e2dcf5;font-weight:500;text-decoration:none;
  padding:6px 0;border-bottom:2px solid transparent}
.pn-links a:hover{color:#fff}
.pn-links a.active{color:#fff;border-bottom-color:#8b5cf6}
.pn-btn{display:inline-flex;align-items:center;gap:9px;height:42px;padding:0 24px;
  border-radius:14px;font-size:15px;font-weight:500;color:#fff;text-decoration:none;
  font-family:inherit;cursor:pointer}
.pn-btn.primary{background:linear-gradient(180deg,#8b5cf6,#6d45f2);
  box-shadow:0 6px 24px rgba(124,77,255,.45),inset 0 1px 0 rgba(255,255,255,.25)}
.pn-btn.outline{background:rgba(15,10,35,.35);border:1px solid rgba(255,255,255,.28)}
@media (max-width:860px){
  .pn{height:auto}
  .pn-in{flex-wrap:wrap;padding:10px 16px;row-gap:8px}
  .pn-links{order:3;width:100%;margin-left:0;gap:28px;justify-content:center}
  .pn-btn{height:38px;padding:0 16px;font-size:14px}
}
`;