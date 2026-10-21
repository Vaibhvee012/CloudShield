import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  CloudCog,
  Gauge,
  ListOrdered,
  ScrollText,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import PublicFooter from "./PublicFooter";

/* Sections that continue the landing page below the dashboard preview.
   All content here is descriptive or clearly labelled sample data. */

type Feature = { title: string; body: string; icon: LucideIcon };

const features: Feature[] = [
  {
    title: "Discover your resources",
    body: "Reads configuration for EC2, S3, RDS and IAM through a role you create, and keeps the time of the latest sync.",
    icon: CloudCog,
  },
  {
    title: "Find misconfigurations",
    body: "Security rules turn what was discovered into findings, ranked from Critical to Low.",
    icon: ShieldAlert,
  },
  {
    title: "See your security score",
    body: "A 0 to 100 score calculated from your open findings. It is a CloudShield measure, not an official AWS metric.",
    icon: Gauge,
  },
  {
    title: "Know what to fix first",
    body: "Ask the AI to prioritize your open findings so the riskiest items come first.",
    icon: ListOrdered,
  },
  {
    title: "Understand every finding",
    body: "Get plain-language explanations and suggested remediation steps. Suggestions are advisory only.",
    icon: Sparkles,
  },
  {
    title: "Review the audit trail",
    body: "Sign-ins, syncs, AI requests and denied access attempts are recorded so you can see what happened.",
    icon: ScrollText,
  },
];

const howItWorks = [
  {
    title: "Connect a role",
    body: "Create a read-only IAM role in your AWS account and paste its ARN. No access keys needed.",
  },
  {
    title: "Run a sync",
    body: "CloudShield reads your resources and generates findings from its security rules.",
  },
  {
    title: "Review and fix",
    body: "Check your score, ask the assistant for explanations, then apply fixes yourself in AWS.",
  },
];

const guarantees = [
  "Only makes read calls to your AWS account",
  "Every query is scoped to the signed-in user",
  "Remediation is advice, never applied automatically",
];

const faq = [
  {
    q: "Does CloudShield change my AWS resources?",
    a: "No. It only reads configuration. Remediation suggestions are advice, and you apply any fix yourself.",
  },
  {
    q: "Do I need to give you my AWS access keys?",
    a: "No. You create an IAM role and share its ARN. CloudShield verifies the role through AWS STS before saving the connection.",
  },
  {
    q: "Has CloudShield been independently audited?",
    a: "No. It is an actively developed project and has not had an independent security audit.",
  },
];

const sectionTitle =
  "text-3xl font-semibold tracking-tight text-white sm:text-4xl";
const sectionIntro = "mt-4 max-w-2xl text-base leading-relaxed text-white/55";

export default function LandingSections() {
  const isLoggedIn = Boolean(localStorage.getItem("cloudshield_token"));

  return (
    <div className="relative overflow-hidden bg-[#0c0720] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[360px] w-[900px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[120px]"
      />

      {/* Features */}
      <section id="features" className="relative mx-auto max-w-6xl px-5 pb-24 pt-28">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-violet-300">
          What it does
        </p>
        <h2 className={`${sectionTitle} mt-3 max-w-2xl`}>
          Everything you need to understand your AWS security posture.
        </h2>
        <p className={sectionIntro}>
          From the first sync to a prioritized list of fixes, in one place.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ title, body, icon: Icon }) => (
            <div
              key={title}
              className="group rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 transition-colors duration-200 hover:border-violet-500/40 hover:bg-violet-500/[0.04]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300 transition-colors group-hover:bg-violet-500/25">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-[17px] font-semibold text-white">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative border-y border-white/[0.06] bg-black/20">
        <div className="mx-auto max-w-6xl px-5 py-24">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-violet-300">
            How it works
          </p>
          <h2 className={`${sectionTitle} mt-3`}>Three steps to your first findings.</h2>

          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {howItWorks.map((step, i) => (
              <li key={step.title} className="relative">
                {i < howItWorks.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute left-12 right-[-24px] top-5 hidden h-px bg-gradient-to-r from-violet-500/50 to-transparent md:block"
                  />
                )}
                <span className="relative flex h-10 w-10 items-center justify-center rounded-full border border-violet-400/50 bg-[#120C26] text-sm font-semibold text-violet-300 shadow-[0_0_18px_rgba(139,92,246,0.35)]">
                  {i + 1}
                </span>
                <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>

          <Link
            to="/docs"
            className="mt-10 inline-flex items-center gap-1.5 text-sm font-medium text-violet-300 transition-colors hover:text-violet-200"
          >
            Read the setup guide <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* AI assistant */}
      <section id="assistant" className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-24 lg:grid-cols-2">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-violet-300">
            AI assistant
          </p>
          <h2 className={`${sectionTitle} mt-3`}>
            Ask questions about your own security data.
          </h2>
          <p className={sectionIntro}>
            The assistant works from the findings and resources in your
            account. It explains issues in plain language, suggests what to
            fix first and describes remediation steps you can apply yourself.
          </p>
        </div>

        <div className="rounded-2xl border border-violet-500/30 bg-[#0B0914] p-5 shadow-[0_0_50px_-15px_rgba(139,92,246,0.5)]">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">AI Assistant</span>
            <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[11px] text-white/45">
              Sample conversation
            </span>
          </div>
          <div className="mt-5 space-y-4 text-sm">
            <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-violet-600 px-4 py-2.5 text-white">
              Which finding should I fix first?
            </div>
            <div className="max-w-[88%] rounded-2xl rounded-bl-md border border-white/[0.08] bg-white/[0.04] px-4 py-3 leading-relaxed text-white/75">
              <span className="mb-2 inline-block rounded bg-violet-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-violet-300">
                Advisory
              </span>
              <p>
                Start with the public S3 bucket. Its contents may be readable
                by anyone on the internet. Block public access on the bucket,
                then review its policy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Read-only guarantee */}
      <section className="relative mx-auto max-w-6xl px-5 pb-24">
        <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-br from-violet-600/[0.12] to-transparent p-8 sm:p-12">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Built to look, not to touch.
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-3">
            {guarantees.map((g) => (
              <li key={g} className="flex gap-3 text-sm leading-snug text-white/75">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" strokeWidth={2.4} />
                {g}
              </li>
            ))}
          </ul>
          <Link
            to="/security"
            className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-violet-300 transition-colors hover:text-violet-200"
          >
            How security works <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative mx-auto max-w-3xl px-5 pb-24">
        <h2 className={sectionTitle}>Common questions</h2>
        <div className="mt-8 divide-y divide-white/[0.08] border-y border-white/[0.08]">
          {faq.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-medium text-white/90">
                {item.q}
                <span
                  aria-hidden="true"
                  className="font-mono text-xl text-violet-300 transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-white/55">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative mx-auto max-w-5xl px-5 pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-violet-500/40 bg-[#100A24] px-6 py-14 text-center sm:px-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 h-48 w-[600px] -translate-x-1/2 rounded-full bg-violet-500/25 blur-[90px]"
          />
          <h2 className="relative text-3xl font-semibold tracking-tight sm:text-4xl">
            Secure your cloud, confidently.
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-base text-white/60">
            Connect an AWS account with a read-only role and see your first
            findings after a sync.
          </p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to={isLoggedIn ? "/connect" : "/register"}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-6 py-3 text-sm font-medium text-white shadow-[0_6px_24px_rgba(124,77,255,0.45)] transition-colors hover:bg-violet-400"
            >
              {isLoggedIn ? "Connect AWS" : "Get started"}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/platform"
              className="rounded-xl border border-white/25 px-6 py-3 text-sm font-medium text-white/90 transition-colors hover:border-white/50"
            >
              Explore platform
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}