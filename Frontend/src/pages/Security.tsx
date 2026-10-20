import { Link } from "react-router-dom";
import { Check, X } from "lucide-react";
import PublicNav from "../components/PublicNav";
import PublicFooter from "../components/PublicFooter";

/* Security: a ledger. Commitments on one side, hard limits on the other,
   then a table of the controls behind them. */

const does = [
  "Reads configuration through a role you create",
  "Verifies the role with AWS STS before saving a connection",
  "Scopes every query to the signed-in user",
  "Records security-relevant actions in an audit log",
];

const neverDoes = [
  "Change or delete resources in your AWS account",
  "Ask you for access keys",
  "Apply remediation automatically",
  "Show one user's data to another user",
];

const controls: { area: string; detail: string }[] = [
  {
    area: "Accounts",
    detail:
      "Passwords are hashed with bcrypt. Sessions expire after 24 hours.",
  },
  {
    area: "Isolation",
    detail:
      "Asking for another user's finding or connection returns not found. An automated isolation test suite covers this.",
  },
  {
    area: "AI",
    detail:
      "Text from your AWS account, such as resource names, is treated as untrusted data in prompts. Requests are rate limited and time limited, and answers are labelled advisory.",
  },
  {
    area: "Audit",
    detail:
      "Sign-ins, including failed ones, syncs, AI requests and attempts to reach something that is not yours are logged per user.",
  },
];

export default function Security() {
  return (
    <div className="flex min-h-screen flex-col bg-[#07060C] text-white">
      <PublicNav />

      <main
        className="flex-1"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      >
        <div className="mx-auto max-w-5xl px-5 pb-24 pt-16 sm:pt-24">
          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            Built to look,
            <br className="hidden sm:block" /> not to touch.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/60">
            CloudShield reads your AWS configuration and gives advice. It does
            not change your resources, and it only makes read calls to AWS.
          </p>

          {/* Commitments vs limits */}
          <div className="mt-14 grid overflow-hidden rounded-2xl border border-white/10 bg-[#0B0914]/90 md:grid-cols-2">
            <section className="p-6 sm:p-8">
              <h2 className="text-sm font-semibold text-emerald-400">
                What it does
              </h2>
              <ul className="mt-5 space-y-4">
                {does.map((item) => (
                  <li key={item} className="flex gap-3 text-[15px] leading-snug text-white/80">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" strokeWidth={2.4} />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
            <section className="border-t border-white/10 bg-red-500/[0.03] p-6 sm:p-8 md:border-l md:border-t-0">
              <h2 className="text-sm font-semibold text-red-400">
                What it never does
              </h2>
              <ul className="mt-5 space-y-4">
                {neverDoes.map((item) => (
                  <li key={item} className="flex gap-3 text-[15px] leading-snug text-white/80">
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-red-400" strokeWidth={2.4} />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Controls ledger */}
          <h2 className="mt-20 text-2xl font-semibold tracking-tight">
            The controls behind it
          </h2>
          <dl className="mt-6 divide-y divide-white/[0.08] border-y border-white/[0.08]">
            {controls.map((c) => (
              <div
                key={c.area}
                className="grid gap-1 py-5 sm:grid-cols-[160px_1fr] sm:gap-8"
              >
                <dt className="text-[15px] font-medium text-violet-300">
                  {c.area}
                </dt>
                <dd className="text-[15px] leading-relaxed text-white/60">
                  {c.detail}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-12 rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-5 text-sm leading-relaxed text-amber-100/80">
            CloudShield is an actively developed project and has not been
            independently audited. Questions about how it works? See the{" "}
            <Link to="/docs" className="text-violet-300 underline-offset-2 hover:underline">
              documentation
            </Link>
            .
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}