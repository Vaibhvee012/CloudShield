import { Link } from "react-router-dom";
import PublicNav from "../components/PublicNav";
import PublicFooter from "../components/PublicFooter";

/* Docs: a reference layout with a sticky "on this page" rail,
   monospace step labels and an FAQ. */

const toc = [
  { id: "account", label: "Create an account" },
  { id: "role", label: "Create an IAM role" },
  { id: "connect", label: "Connect AWS" },
  { id: "sync", label: "Run a sync" },
  { id: "review", label: "Review and act" },
  { id: "faq", label: "FAQ" },
];

const faq = [
  {
    q: "Does CloudShield change my AWS resources?",
    a: "No. It only makes read calls. Remediation suggestions are advice, and you apply any fix yourself in AWS.",
  },
  {
    q: "How is the security score calculated?",
    a: "From your open findings, on a 0 to 100 scale. It is a CloudShield-defined score, not an official AWS metric.",
  },
  {
    q: "Can I remove my connection?",
    a: "Yes. You can remove the connection at any time.",
  },
  {
    q: "Has CloudShield been independently audited?",
    a: "No. It is an actively developed project and has not had an independent audit.",
  },
];

const stepHead =
  "scroll-mt-24 font-mono text-[12px] uppercase tracking-wider text-violet-300";
const stepTitle = "mt-1 text-2xl font-semibold tracking-tight";
const stepText = "mt-3 max-w-2xl text-[15px] leading-relaxed text-white/60";

export default function Docs() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0A0914] text-white">
      <PublicNav />

      <main className="flex-1">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 pb-24 pt-12 lg:grid-cols-[210px_1fr] lg:pt-16">
          {/* Rail */}
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <p className="font-mono text-[11px] uppercase tracking-wider text-white/35">
              On this page
            </p>
            <nav aria-label="On this page" className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm lg:flex-col lg:gap-y-1">
              {toc.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="border-white/10 text-white/55 transition-colors hover:text-white lg:border-l lg:py-1 lg:pl-3 lg:hover:border-violet-400"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <article className="min-w-0">
            <p className="font-mono text-[12px] text-white/40">
              Documentation / Getting started
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              Getting started
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/60">
              From a new account to your first findings in five steps.
              Detailed guides are still being written.
            </p>

            <div className="mt-14 space-y-14">
              <section>
                <p id="account" className={stepHead}>Step 1</p>
                <h2 className={stepTitle}>Create an account</h2>
                <p className={stepText}>
                  <Link to="/register" className="text-violet-300 hover:underline">
                    Register
                  </Link>{" "}
                  with your name, email and a password of at least 8
                  characters, then sign in.
                </p>
              </section>

              <section>
                <p id="role" className={stepHead}>Step 2</p>
                <h2 className={stepTitle}>Create an IAM role</h2>
                <p className={stepText}>
                  In your AWS account, create a role that CloudShield can
                  assume and attach a read-only security policy to it. Copy
                  the role ARN, which looks like this:
                </p>
                <pre className="mt-4 overflow-x-auto rounded-lg border border-white/10 bg-black/40 p-4 font-mono text-[13px] text-violet-200">
                  arn:aws:iam::&lt;ACCOUNT_ID&gt;:role/&lt;ROLE_NAME&gt;
                </pre>
              </section>

              <section>
                <p id="connect" className={stepHead}>Step 3</p>
                <h2 className={stepTitle}>Connect AWS</h2>
                <p className={stepText}>
                  Open Connect AWS and enter your 12 digit account ID, the
                  role ARN and the region. CloudShield checks that the role
                  belongs to that account before saving the connection.
                </p>
              </section>

              <section>
                <p id="sync" className={stepHead}>Step 4</p>
                <h2 className={stepTitle}>Run a sync</h2>
                <p className={stepText}>
                  Start a sync from the dashboard. CloudShield reads your
                  resources and generates findings.
                </p>
              </section>

              <section>
                <p id="review" className={stepHead}>Step 5</p>
                <h2 className={stepTitle}>Review and act</h2>
                <p className={stepText}>
                  Check your findings and security score, ask the AI
                  assistant to explain or prioritize them, and apply fixes
                  yourself in AWS.
                </p>
              </section>

              <section>
                <h2 id="faq" className="scroll-mt-24 text-2xl font-semibold tracking-tight">
                  FAQ
                </h2>
                <div className="mt-5 divide-y divide-white/[0.08] border-y border-white/[0.08]">
                  {faq.map((item) => (
                    <details key={item.q} className="group py-4">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium text-white/85">
                        {item.q}
                        <span
                          aria-hidden="true"
                          className="font-mono text-violet-300 transition-transform group-open:rotate-45"
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
                <p className="mt-6 text-sm text-white/40">
                  Full setup guides and IAM policy examples will be added
                  here.
                </p>
              </section>
            </div>
          </article>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}