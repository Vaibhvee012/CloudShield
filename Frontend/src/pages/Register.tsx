import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  UserPlus,
} from "lucide-react";


const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const Register = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      console.log("REGISTER RESPONSE:", data);

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      navigate("/login");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08070d] text-white overflow-hidden">
      <div className="relative min-h-screen flex">

        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-purple-600/20 blur-[140px]" />

          <div className="absolute left-[35%] bottom-[-250px] h-[550px] w-[550px] rounded-full bg-violet-700/15 blur-[150px]" />

          <div className="absolute right-[-200px] top-[15%] h-[500px] w-[500px] rounded-full bg-fuchsia-600/10 blur-[150px]" />

          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "70px 70px",
            }}
          />
        </div>

        {/* LEFT SIDE */}
        <div className="relative hidden lg:flex lg:w-[56%] min-h-screen flex-col justify-between px-14 py-12">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-violet-700 shadow-[0_0_35px_rgba(139,92,246,0.35)]">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>

            <div>
              <div className="text-lg font-bold tracking-tight">
                CloudShield
              </div>

              <div className="text-[10px] uppercase tracking-[0.25em] text-purple-300/70">
                Cloud Security Platform
              </div>
            </div>
          </div>

          {/* Main visual */}
          <div className="relative flex flex-1 items-center justify-center">

            {/* Orbital rings */}
            <div className="absolute h-[440px] w-[440px] rounded-full border border-purple-400/10" />

            <div className="absolute h-[350px] w-[350px] rounded-full border border-purple-400/15" />

            <div className="absolute h-[260px] w-[260px] rounded-full border border-purple-400/20" />

            <div className="absolute h-[440px] w-[440px] rounded-full border border-dashed border-purple-400/20" />

            {/* Glow */}
            <div className="absolute h-64 w-64 rounded-full bg-purple-600/20 blur-[90px]" />

            {/* Central shield */}
            <div className="relative z-10 flex h-36 w-36 items-center justify-center rounded-[38px] border border-purple-300/20 bg-white/[0.04] shadow-[0_0_100px_rgba(139,92,246,0.25)] backdrop-blur-xl">

              <div className="absolute inset-3 rounded-[30px] border border-purple-400/10" />

              <ShieldCheck
                className="h-16 w-16 text-purple-300"
                strokeWidth={1.4}
              />

              <div className="absolute -right-3 -top-3 flex h-9 w-9 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>
            </div>

            {/* Floating resource nodes */}

            <div className="absolute left-[12%] top-[32%] rounded-xl border border-white/10 bg-white/[0.045] px-4 py-3 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />

                <div>
                  <p className="text-xs font-medium">
                    AWS Resources
                  </p>

                  <p className="text-[10px] text-slate-500">
                    Protected
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute right-[10%] top-[27%] rounded-xl border border-white/10 bg-white/[0.045] px-4 py-3 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(167,139,250,0.8)]" />

                <div>
                  <p className="text-xs font-medium">
                    AI Security
                  </p>

                  <p className="text-[10px] text-slate-500">
                    Monitoring
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute bottom-[23%] left-[22%] rounded-xl border border-white/10 bg-white/[0.045] px-4 py-3 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]" />

                <div>
                  <p className="text-xs font-medium">
                    Threat Detection
                  </p>

                  <p className="text-[10px] text-slate-500">
                    Active
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute bottom-[20%] right-[18%] rounded-xl border border-white/10 bg-white/[0.045] px-4 py-3 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />

                <div>
                  <p className="text-xs font-medium">
                    Cloud Posture
                  </p>

                  <p className="text-[10px] text-slate-500">
                    Analyzing
                  </p>
                </div>
              </div>
            </div>

            {/* Connecting lines */}
            <div className="absolute left-[25%] top-[42%] h-px w-[18%] bg-gradient-to-r from-transparent via-purple-400/30 to-purple-400/50" />

            <div className="absolute right-[25%] top-[40%] h-px w-[18%] bg-gradient-to-l from-transparent via-purple-400/30 to-purple-400/50" />
          </div>

          {/* Bottom text */}
          <div className="max-w-xl">
            <div className="mb-5 flex items-center gap-2 text-purple-300">
              <Sparkles className="h-4 w-4" />

              <span className="text-xs font-semibold uppercase tracking-[0.22em]">
                Intelligent Cloud Defense
              </span>
            </div>

            <h2 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight">
              Secure your cloud.
              <br />

              <span className="bg-gradient-to-r from-purple-300 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                Before threats become incidents.
              </span>
            </h2>

            <p className="mt-5 max-w-lg text-sm leading-6 text-slate-400">
              CloudShield continuously analyzes your cloud environment,
              identifies security risks, and helps you respond before
              vulnerabilities become real-world incidents.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="relative z-10 flex min-h-screen w-full items-center justify-center px-6 py-10 lg:w-[44%] lg:bg-white/[0.025] lg:px-12 lg:backdrop-blur-sm">

          <div className="w-full max-w-[430px]">

            {/* Mobile logo */}
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-violet-700">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <div>
                <div className="font-bold">
                  CloudShield
                </div>

                <div className="text-[9px] uppercase tracking-[0.2em] text-purple-300/70">
                  Cloud Security
                </div>
              </div>
            </div>

            {/* Register panel */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-7 shadow-2xl shadow-black/20 backdrop-blur-2xl sm:p-9">

              <div className="mb-8">

                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-400/20 bg-purple-500/10">
                  <UserPlus className="h-5 w-5 text-purple-300" />
                </div>

                <h1 className="text-3xl font-semibold tracking-tight">
                  Create account
                </h1>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Create your CloudShield security account.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-5 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-5">

                {/* Full Name */}
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-400">
                    Full name
                  </label>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    required
                    className="h-13 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-purple-400/60 focus:bg-purple-500/[0.04] focus:ring-2 focus:ring-purple-500/10"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-400">
                    Email address
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    className="h-13 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-purple-400/60 focus:bg-purple-500/[0.04] focus:ring-2 focus:ring-purple-500/10"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-400">
                    Password
                  </label>

                  <div className="relative">

                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      required
                      minLength={6}
                      className="h-13 w-full rounded-xl border border-white/10 bg-black/20 px-4 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-purple-400/60 focus:bg-purple-500/[0.04] focus:ring-2 focus:ring-purple-500/10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((previous) => !previous)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:bg-white/5 hover:text-slate-300"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>

                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative flex h-13 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600 text-sm font-semibold text-white shadow-[0_10px_35px_rgba(124,58,237,0.25)] transition duration-300 hover:shadow-[0_12px_45px_rgba(124,58,237,0.4)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span>
                    {loading
                      ? "Creating account..."
                      : "Create CloudShield account"}
                  </span>

                  {!loading && (
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  )}
                </button>
              </form>

              {/* Security status */}
              <div className="mt-7 flex items-center justify-center gap-2 border-t border-white/5 pt-6">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />

                <span className="text-[11px] text-slate-500">
                  Secure connection · CloudShield Protected
                </span>
              </div>

              {/* Login link */}
              <div className="mt-4 text-center">
                <p className="text-xs text-slate-500">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-medium text-purple-300 transition hover:text-purple-200"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>

            <p className="mt-6 text-center text-[11px] text-slate-600">
              CloudShield Security Platform · Enterprise Cloud Protection
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
