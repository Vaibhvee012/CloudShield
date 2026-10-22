import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Bot,
  CheckCircle2,
  MessageSquare,
  Send,
  ShieldAlert,
  Sparkles,
  Trash2,
} from "lucide-react";

import AIText from "../components/AIText";
import { PageError, PageLoading } from "../components/PageState";
import { useApiData } from "../hooks/useApiData";
import type { ConnectionState } from "../hooks/useApiData";
import {
  ApiError,
  chatWithAI,
  getRemediationActions,
  getSecurityPosture,
} from "../services/api";

interface PostureData {
  state: ConnectionState;
  securityScore: number | null;
  totalFindings: number;
  resources: {
    total: number;
  };
}

interface ChatMessage {
  id: number;
  role: "user" | "assistant" | "error";
  message: string;
}

function AIAssistant() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState(false);

  const nextId = useRef(1);
  const bottomRef = useRef<HTMLDivElement>(null);

  const {
    data: posture,
    loading: postureLoading,
    error: postureError,
    reload: reloadPosture,
  } = useApiData<PostureData>(
    getSecurityPosture,
    "Failed to load your security data"
  );

  const { data: remediation, error: remediationError } = useApiData<
    unknown[]
  >(getRemediationActions, "Failed to load remediation suggestions");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [messages, pending]);

  if (postureLoading) {
    return <PageLoading label="Loading your security context..." />;
  }

  if (postureError || !posture) {
    return (
      <PageError
        title="Unable to load the assistant"
        message={postureError || "Security data is unavailable."}
        onRetry={reloadPosture}
      />
    );
  }

  const canChat = posture.state === "READY";

  const send = async (text: string) => {
    const trimmed = text.trim();

    if (!trimmed || pending || !canChat) return;

    const userMessageId = nextId.current++;

    setMessages((previous) => [
      ...previous,
      { id: userMessageId, role: "user", message: trimmed },
    ]);
    setQuestion("");
    setPending(true);

    try {
      const response = await chatWithAI(trimmed);
      const answer = response?.data?.response;
      const replyId = nextId.current++;

      setMessages((previous) => [
        ...previous,
        {
          id: replyId,
          role: "assistant",
          message:
            typeof answer === "string" && answer.trim()
              ? answer
              : "The assistant returned an empty answer. Please try again.",
        },
      ]);
    } catch (error) {
      const errorId = nextId.current++;

      setMessages((previous) => [
        ...previous,
        {
          id: errorId,
          role: "error",
          message:
            error instanceof ApiError
              ? error.message
              : "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setPending(false);
    }
  };

  const statusText = !canChat
    ? posture.state === "NOT_CONNECTED"
      ? "Connect AWS to start"
      : "Waiting for your first scan"
    : pending
      ? "Thinking..."
      : "Ready";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C084FC]/10">
            <Sparkles size={21} className="text-[#C084FC]" />
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
                <Bot size={19} className="text-[#C084FC]" />

                <span
                  className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0B0914] ${
                    canChat ? "bg-[#22C55E]" : "bg-gray-500"
                  }`}
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-white">
                  CloudShield AI
                </p>

                <p
                  className={`text-[11px] ${
                    canChat ? "text-[#22C55E]" : "text-gray-500"
                  }`}
                >
                  {statusText}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {messages.length > 0 && !pending && (
                <button
                  type="button"
                  onClick={() => setMessages([])}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] text-gray-500 hover:bg-white/5 hover:text-gray-300"
                >
                  <Trash2 size={13} />
                  Clear
                </button>
              )}

              <div className="rounded-lg bg-[#C084FC]/10 px-2.5 py-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C084FC]">
                  AI
                </span>
              </div>
            </div>
          </div>

          {/* Chat Content */}
          <div className="flex flex-1 flex-col px-6 py-8">
            {messages.length === 0 ? (
              <div className="flex flex-1 flex-col justify-center">
                <div className="mx-auto w-full max-w-xl text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#C084FC]/20 bg-[#C084FC]/10 shadow-[0_0_30px_rgba(192,132,252,0.1)]">
                    <Sparkles size={28} className="text-[#C084FC]" />
                  </div>

                  {canChat ? (
                    <>
                      <h2 className="mt-5 text-lg font-semibold text-white">
                        How can I help secure your cloud?
                      </h2>

                      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                        Ask about your security findings, risks or score.
                      </p>

                      {/* Suggested Questions */}
                      <div className="mt-8 grid gap-3 sm:grid-cols-2">
                        <SuggestionCard
                          icon={<ShieldAlert size={16} />}
                          text="What are my most critical security risks?"
                          onClick={send}
                        />

                        <SuggestionCard
                          icon={<MessageSquare size={16} />}
                          text="Explain my current security posture"
                          onClick={send}
                        />

                        <SuggestionCard
                          icon={<CheckCircle2 size={16} />}
                          text="Which findings should I remediate first?"
                          onClick={send}
                        />

                        <SuggestionCard
                          icon={<Sparkles size={16} />}
                          text="How can I improve my security score?"
                          onClick={send}
                        />
                      </div>
                    </>
                  ) : posture.state === "NOT_CONNECTED" ? (
                    <>
                      <h2 className="mt-5 text-lg font-semibold text-white">
                        Connect your AWS account first
                      </h2>

                      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                        The assistant answers from your own scan results, so it
                        needs a connected AWS account.
                      </p>

                      <Link
                        to="/connect"
                        className="mt-6 inline-flex items-center rounded-lg bg-[#8B5CF6] px-4 py-2 text-sm font-medium text-white hover:bg-[#7C3AED]"
                      >
                        Connect AWS
                      </Link>
                    </>
                  ) : (
                    <>
                      <h2 className="mt-5 text-lg font-semibold text-white">
                        Run your first scan
                      </h2>

                      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                        Your AWS account is connected. Run a scan from the
                        dashboard, then come back to ask questions about the
                        results.
                      </p>

                      <Link
                        to="/dashboard"
                        className="mt-6 inline-flex items-center rounded-lg bg-[#8B5CF6] px-4 py-2 text-sm font-medium text-white hover:bg-[#7C3AED]"
                      >
                        Go to dashboard
                      </Link>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="max-h-[480px] flex-1 space-y-4 overflow-y-auto pr-2">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    {message.role === "user" ? (
                      <div className="max-w-[80%] whitespace-pre-line rounded-2xl bg-[#8B5CF6] px-4 py-3 text-sm leading-6 text-white">
                        {message.message}
                      </div>
                    ) : message.role === "error" ? (
                      <div className="max-w-[80%] rounded-2xl border border-[#EF4444]/20 bg-[#EF4444]/10 px-4 py-3 text-sm leading-6 text-red-200">
                        {message.message}
                      </div>
                    ) : (
                      <div className="max-w-[80%] rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                        <AIText text={message.message} />
                      </div>
                    )}
                  </div>
                ))}

                {pending && (
                  <div className="flex justify-start">
                    <div className="animate-pulse rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-gray-500">
                      CloudShield AI is thinking...
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-white/10 p-4">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                send(question);
              }}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-2.5 focus-within:border-[#8B5CF6]/40"
            >
              <input
                type="text"
                value={question}
                maxLength={2000}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder={
                  canChat
                    ? "Ask CloudShield AI about your cloud security..."
                    : "Connect AWS and run a scan to start chatting"
                }
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-600"
                disabled={!canChat || pending}
              />

              <button
                type="submit"
                disabled={!question.trim() || !canChat || pending}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#8B5CF6] text-white transition hover:bg-[#7C3AED] disabled:cursor-not-allowed disabled:opacity-40"
                title="Send question"
              >
                <Send size={16} />
              </button>
            </form>

            <p className="mt-2 text-center text-[10px] text-gray-700">
              Answers are generated by AI from your latest scan. Each question
              is answered on its own. Advisory only.
            </p>
          </div>
        </div>

        {/* Security Context */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-[#0B0914] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#8B5CF6]/10">
                <ShieldAlert size={18} className="text-[#A78BFA]" />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-white">
                  Security Context
                </h2>

                <p className="text-[11px] text-gray-600">
                  From your latest scan
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <ContextRow
                label="Resources"
                value={`${posture.resources?.total ?? 0} resources`}
              />

              <ContextRow
                label="Open findings"
                value={`${posture.totalFindings ?? 0} findings`}
              />

              <ContextRow
                label="Remediation"
                value={
                  remediationError || !remediation
                    ? "Unavailable"
                    : `${remediation.length} suggestions`
                }
              />

              <ContextRow
                label="Posture"
                value={
                  posture.securityScore === null
                    ? "Not scored yet"
                    : `${posture.securityScore}/100`
                }
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

          {/* About */}
          <div className="rounded-2xl border border-[#C084FC]/10 bg-[#C084FC]/5 p-5">
            <div className="flex items-start gap-3">
              <Sparkles
                size={18}
                className="mt-0.5 shrink-0 text-[#C084FC]"
              />

              <div>
                <p className="text-xs font-semibold text-[#C084FC]">
                  How answers are made
                </p>

                <p className="mt-1 text-[11px] leading-5 text-gray-500">
                  Questions are answered by Gemini using a summary of your
                  latest scan: your totals plus up to 25 of your most severe
                  findings. The assistant only advises. It never changes your
                  AWS resources.
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
  onClick,
}: {
  icon: ReactNode;
  text: string;
  onClick: (text: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(text)}
      className="group flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left transition hover:border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/5"
    >
      <span className="mt-0.5 text-[#A78BFA]">{icon}</span>

      <span className="text-xs leading-5 text-gray-400">{text}</span>
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
      <span className="text-xs text-gray-500">{label}</span>

      <span className="text-[11px] font-medium text-gray-400">{value}</span>
    </div>
  );
}

function Capability({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle2 size={14} className="text-[#22C55E]" />

      <span className="text-xs text-gray-400">{text}</span>
    </div>
  );
}

export default AIAssistant;