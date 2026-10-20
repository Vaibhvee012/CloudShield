import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import PublicNav from "../components/PublicNav";
import PublicFooter from "../components/PublicFooter";

/* Platform: a vertical pipeline. The content really is a sequence,
   so the numbered stages carry meaning. */

type Stage = {
  title: string;
  body: string;
  sample: ReactNode;
};

const chip =
  "rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-white/70";

const stages: Stage[] = [
  {
    title: "Connect with an IAM role",
    body: "You create a role in your AWS account and give CloudShield its ARN. The role is verified through AWS STS before the connection is saved, so a wrong account or role is rejected up front.",
    sample: (
      <div className="space-y-2 font-mono text-[11px]">
        <div className="rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white/60">
          arn:aws:iam::123456789012:role/CloudShieldRead
        </div>
        <div className="flex items-center gap-2 text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Role verified
        </div>
      </div>
    ),
  },
  {
    title: "Discover your resources",
    body: "CloudShield reads configuration for EC2, S3, RDS and IAM resources and stores it for your account. Each connection keeps the time of its latest sync.",
    sample: (
      <div className="flex flex-wrap gap-2">
        {["EC2", "S3", "RDS", "IAM"].map((t) => (
          <span key={t} className={chip}>
            {t}
          </span>
        ))}
        <span className="w-full pt-1 text-[11px] text-white/40">
          Last synced after each run
        </span>
      </div>
    ),
  },
  {
    title: "Detect misconfigurations",
    body: "Security rules check what was discovered and create findings. Each finding is ranked Critical, High, Medium or Low so the riskiest items come first.",
    sample: (
      <div className="flex flex-wrap gap-2 text-[11px] font-medium">
        <span className="rounded-md bg-red-500/15 px-2 py-1 text-red-400">Critical</span>
        <span className="rounded-md bg-orange-500/15 px-2 py-1 text-orange-400">High</span>
        <span className="rounded-md bg-amber-500/15 px-2 py-1 text-amber-400">Medium</span>
        <span className="rounded-md bg-sky-500/15 px-2 py-1 text-sky-400">Low</span>
      </div>
    ),
  },
  {
    title: "Score and prioritize",
    body: "A 0 to 100 security score is calculated from your open findings. It is a CloudShield-defined score, not an official AWS metric. The AI can also rank what to fix first.",
    sample: (
      <div className="flex items-end gap-3">
        <span className="text-4xl font-semibold leading-none text-white">78</span>
        <span className="pb-0.5 text-xs text-white/45">/ 100, sample</span>
      </div>
    ),
  },
  {
    title: "Explain and advise",
    body: "Ask the assistant to explain a finding in plain language and suggest remediation steps. Suggestions are advisory only: you apply any fix yourself in AWS.",
    sample: (
      <div className="space-y-2 text-[12px] leading-relaxed text-white/65">
        <span className="inline-block rounded bg-violet-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-violet-300">
          Advisory
        </span>
        <p>Block public access on this bucket, then review its policy.</p>
      </div>
    ),
  },
];

export default function Platform() {
  return (
    <div className="flex min-h-screen flex-col bg-[#08070D] text-white">
      <PublicNav />

      <main className="relative flex-1 overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-violet-600/20 blur-[120px]"
        />

        <div className="relative mx-auto max-w-6xl px-5 pb-24 pt-16 sm:pt-24">
          <h1 className="max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
            From an IAM role to a ranked list of fixes.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/60">
            CloudShield connects to your AWS account, reads its configuration,
            flags what is misconfigured and helps you decide what to fix
            first.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            <Link
              to="/register"
              className="rounded-xl bg-violet-500 px-5 py-2.5 font-medium text-white shadow-[0_6px_24px_rgba(124,77,255,0.4)] transition-colors hover:bg-violet-400"
            >
              Create an account
            </Link>
            <Link
              to="/docs"
              className="rounded-xl border border-white/20 px-5 py-2.5 font-medium text-white/85 transition-colors hover:border-white/40"
            >
              Read the docs
            </Link>
          </div>

          {/* Pipeline */}
          <ol className="relative mt-20 space-y-10 sm:mt-28">
            <div
              aria-hidden="true"
              className="absolute bottom-4 left-[19px] top-4 w-px bg-gradient-to-b from-violet-500/70 via-violet-500/25 to-transparent"
            />
            {stages.map((stage, i) => (
              <li
                key={stage.title}
                className="relative grid gap-5 pl-14 md:grid-cols-[1.15fr_1fr] md:gap-10"
              >
                <span className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border border-violet-400/50 bg-[#120C26] text-sm font-semibold text-violet-300 shadow-[0_0_18px_rgba(139,92,246,0.35)]">
                  {i + 1}
                </span>
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">
                    {stage.title}
                  </h2>
                  <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-white/55">
                    {stage.body}
                  </p>
                </div>
                <div className="self-start rounded-xl border border-white/[0.08] bg-[#0D0A1A] p-4">
                  {stage.sample}
                </div>
              </li>
            ))}
          </ol>

          <p className="mt-20 max-w-2xl border-t border-white/[0.07] pt-6 text-sm leading-relaxed text-white/45">
            Every sign-in, sync, AI request and denied access attempt is
            recorded in an audit log you can review. Examples above are
            illustrative samples, not data from a real account.
          </p>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}