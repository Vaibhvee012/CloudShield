import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CircleHelp, X } from "lucide-react";

/**
 * The 12-digit AWS account ID that CloudShield's backend runs under, i.e. the
 * account that owns the credentials in the backend's AWS_ACCESS_KEY_ID.
 * Find it by running `aws sts get-caller-identity` with those credentials.
 * Users put this account in the role's trust policy (step 4).
 */
const CLOUDSHIELD_ACCOUNT_ID = "";

const ROLE_NAME = "CloudShieldReadOnly";

type Step = { title: string; body: React.ReactNode };

const code =
  "rounded bg-black/40 px-1.5 py-0.5 font-mono text-[12px] text-violet-200";

const steps: Step[] = [
  {
    title: "Sign in to the AWS Console",
    body: (
      <>
        Go to the AWS Management Console and sign in with a user that is
        allowed to create IAM roles, such as an administrator.
      </>
    ),
  },
  {
    title: "Find your Account ID",
    body: (
      <>
        Click your account name in the top-right corner. Your{" "}
        <b className="text-white/85">12-digit Account ID</b> is shown in the
        menu. Copy it, you will paste it into CloudShield in the last step.
      </>
    ),
  },
  {
    title: "Open IAM and start a new role",
    body: (
      <>
        Search for <b className="text-white/85">IAM</b> in the console search
        bar. In the left menu choose <b className="text-white/85">Roles</b>,
        then <b className="text-white/85">Create role</b>.
      </>
    ),
  },
  {
    title: "Choose who can use the role",
    body: (
      <>
        Under trusted entity type pick{" "}
        <b className="text-white/85">AWS account</b>, then{" "}
        <b className="text-white/85">Another AWS account</b>. Enter the
        CloudShield account ID{" "}
        <span className={code}>
          {CLOUDSHIELD_ACCOUNT_ID || "<CLOUDSHIELD_ACCOUNT_ID>"}
        </span>
        . Leave <b className="text-white/85">Require external ID</b> and{" "}
        <b className="text-white/85">Require MFA</b> unticked. Click Next.
      </>
    ),
  },
  {
    title: "Attach a read-only policy",
    body: (
      <>
        Search for <span className={code}>SecurityAudit</span> and tick it.
        It lets CloudShield read security settings only. It cannot change or
        delete anything. Click Next.
      </>
    ),
  },
  {
    title: "Name and create the role",
    body: (
      <>
        Name the role <span className={code}>{ROLE_NAME}</span>, review the
        summary, then click <b className="text-white/85">Create role</b>.
      </>
    ),
  },
  {
    title: "Copy the role ARN",
    body: (
      <>
        Open the role you just created and copy its{" "}
        <b className="text-white/85">ARN</b> from the top of the page. It
        looks like{" "}
        <span className={code}>
          arn:aws:iam::123456789012:role/{ROLE_NAME}
        </span>
        .
      </>
    ),
  },
  {
    title: "Connect it in CloudShield",
    body: (
      <>
        Close this window and paste your Account ID and the role ARN into the
        form. Pick the region where your resources run, then click{" "}
        <b className="text-white/85">Connect AWS</b>. CloudShield verifies
        the role before saving the connection.
      </>
    ),
  },
];

export default function ConnectHelp() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const trigger = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <div className="mt-4 text-center">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-300 transition-colors hover:text-violet-200 hover:underline"
        >
          <CircleHelp className="h-4 w-4" />
          Don't know how to connect?
        </button>
      </div>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="connect-help-title"
              onClick={(e) => e.stopPropagation()}
              className="relative flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-violet-500/40 bg-[#0B0914] shadow-[0_0_60px_-10px_rgba(139,92,246,0.5)]"
            >
              <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] px-6 py-5">
                <div>
                  <h2
                    id="connect-help-title"
                    className="text-xl font-semibold text-white"
                  >
                    How to connect your AWS account
                  </h2>
                  <p className="mt-1 text-sm text-white/55">
                    8 steps to create a read-only IAM role and find the details
                    this form asks for. It takes about 5 minutes.
                  </p>
                </div>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="rounded-lg p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <ol className="grid gap-3 overflow-y-auto p-6 md:grid-cols-2">
                {steps.map((step, i) => (
                  <li
                    key={step.title}
                    className="flex gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-4"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-[13px] font-semibold text-violet-300">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-[15px] font-semibold text-white">
                        {step.title}
                      </h3>
                      <p className="mt-1 break-words text-[13px] leading-relaxed text-white/60">
                        {step.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="flex items-center justify-between gap-4 border-t border-white/[0.08] px-6 py-4">
                <p className="text-xs text-white/40">
                  CloudShield never asks for your access keys.
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}