import {
  Bot,
  CheckCircle2,
  MessageSquare,
  Send,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

function AIAssistant() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C084FC]/10">
            <Sparkles
              size={21}
              className="text-[#C084FC]"
            />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              AI Security Assistant
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Ask questions about your cloud security posture.
            </p>
          </div>
        </div>
      </div>

      {/* Main Assistant */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Chat */}
        <div className="flex min-h-[600px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0B0914]">
          {/* Chat Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#C084FC]/10">
                <Bot
                  size={19}
                  className="text-[#C084FC]"
                />

                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0B0914] bg-[#22C55E]" />
              </div>

              <div>
                <p className="text-sm font-semibold text-white">
                  CloudShield AI
                </p>

                <p className="text-[11px] text-[#22C55E]">
                  Security assistant ready
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-[#C084FC]/10 px-2.5 py-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C084FC]">
                AI
              </span>
            </div>
          </div>

          {/* Chat Content */}
          <div className="flex flex-1 flex-col justify-center px-6 py-10">
            <div className="mx-auto w-full max-w-xl text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#C084FC]/20 bg-[#C084FC]/10 shadow-[0_0_30px_rgba(192,132,252,0.1)]">
                <Sparkles
                  size={28}
                  className="text-[#C084FC]"
                />
              </div>

              <h2 className="mt-5 text-lg font-semibold text-white">
                How can I help secure your cloud?
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                Ask about security findings, AWS resources, risk reduction,
                compliance, or recommended remediation actions.
              </p>

              {/* Suggested Questions */}
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <SuggestionCard
                  icon={<ShieldAlert size={16} />}
                  text="What are my most critical security risks?"
                />

                <SuggestionCard
                  icon={<MessageSquare size={16} />}
                  text="Explain my current security posture"
                />

                <SuggestionCard
                  icon={<CheckCircle2 size={16} />}
                  text="Which findings should I remediate first?"
                />

                <SuggestionCard
                  icon={<Sparkles size={16} />}
                  text="How can I improve my security score?"
                />
              </div>
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-white/10 p-4">
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-2.5 focus-within:border-[#8B5CF6]/40">
              <input
                type="text"
                placeholder="Ask CloudShield AI about your cloud security..."
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-600"
              />

              <button
                type="button"
                disabled
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#8B5CF6] text-white opacity-50"
                title="AI backend not connected yet"
              >
                <Send size={16} />
              </button>
            </div>

            <p className="mt-2 text-center text-[10px] text-gray-700">
              AI responses will be connected to your CloudShield security data.
            </p>
          </div>
        </div>

        {/* Security Context */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-[#0B0914] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#8B5CF6]/10">
                <ShieldAlert
                  size={18}
                  className="text-[#A78BFA]"
                />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-white">
                  Security Context
                </h2>

                <p className="text-[11px] text-gray-600">
                  Available to the assistant
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <ContextRow
                label="Resources"
                value="Cloud environment"
              />

              <ContextRow
                label="Findings"
                value="Security findings"
              />

              <ContextRow
                label="Remediation"
                value="Security actions"
              />

              <ContextRow
                label="Posture"
                value="Security score"
              />
            </div>
          </div>

          {/* Capabilities */}
          <div className="rounded-2xl border border-white/10 bg-[#0B0914] p-5">
            <h2 className="text-sm font-semibold text-white">
              Assistant Capabilities
            </h2>

            <div className="mt-4 space-y-3">
              <Capability text="Explain security findings" />
              <Capability text="Analyze cloud posture" />
              <Capability text="Suggest remediation steps" />
              <Capability text="Explain security risks" />
            </div>
          </div>

          {/* Status */}
          <div className="rounded-2xl border border-[#C084FC]/10 bg-[#C084FC]/5 p-5">
            <div className="flex items-start gap-3">
              <Sparkles
                size={18}
                className="mt-0.5 shrink-0 text-[#C084FC]"
              />

              <div>
                <p className="text-xs font-semibold text-[#C084FC]">
                  AI Integration
                </p>

                <p className="mt-1 text-[11px] leading-5 text-gray-500">
                  The assistant interface is ready. Connect your AI service
                  to enable real-time security analysis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SuggestionCard({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <button
      type="button"
      disabled
      className="group flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left opacity-80 transition hover:border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/5"
    >
      <span className="mt-0.5 text-[#A78BFA]">
        {icon}
      </span>

      <span className="text-xs leading-5 text-gray-400">
        {text}
      </span>
    </button>
  );
}

function ContextRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0 last:pb-0">
      <span className="text-xs text-gray-500">
        {label}
      </span>

      <span className="text-[11px] font-medium text-gray-400">
        {value}
      </span>
    </div>
  );
}

function Capability({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle2
        size={14}
        className="text-[#22C55E]"
      />

      <span className="text-xs text-gray-400">
        {text}
      </span>
    </div>
  );
}

export default AIAssistant;