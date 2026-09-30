import { useEffect, useState } from "react";
import {
  Bot,
  CheckCircle2,
  MessageSquare,
  Send,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

import {
  getFindings,
  getRemediationActions,
  getResources,
  getSecurityPosture,
} from "../services/api";

interface SecurityData {
  score: number;
  totalFindings: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  resourcesTotal: number;
  healthyResources: number;
  healthPercentage: number;
}

interface Finding {
  id: string;
  title: string;
  severity: string;
  resourceId: string;
  resourceType: string;
  region: string;
  status: string;
  category: string;
  description: string;
  resource?: {
    id: string;
    name: string;
    type: string;
    region: string;
  };
}

interface RemediationAction {
  id: string;
  findingId: string;
  title: string;
  action: string;
  status: string;
  riskReduction: string;
}

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  message: string;
}

function AIAssistant() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [securityData, setSecurityData] = useState<SecurityData | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [remediationActions, setRemediationActions] = useState<
    RemediationAction[]
  >([]);
  const [resources, setResources] = useState<unknown[]>([]);
  const [loadingContext, setLoadingContext] = useState(true);

  useEffect(() => {
    const loadSecurityContext = async () => {
      try {
        const [
          securityResponse,
          findingsResponse,
          remediationResponse,
          resourcesResponse,
        ] = await Promise.all([
          getSecurityPosture(),
          getFindings(),
          getRemediationActions(),
          getResources(),
        ]);

        setSecurityData(
          securityResponse.data ?? securityResponse
        );

        setFindings(findingsResponse.data ?? []);

        setRemediationActions(
          remediationResponse.data ?? []
        );

        setResources(
          resourcesResponse.data ?? []
        );
      } catch (error) {
        console.error(
          "Failed to load AI security context:",
          error
        );
      } finally {
        setLoadingContext(false);
      }
    };

    loadSecurityContext();
  }, []);

  const generateResponse = (input: string) => {
    const query = input.toLowerCase().trim();

    if (!securityData) {
      return "I couldn't load the current CloudShield security data. Please try again.";
    }

    if (
      query.includes("critical") ||
      query.includes("most critical") ||
      query.includes("risks")
    ) {
      const criticalFindings = findings.filter(
        (finding) =>
          finding.severity.toLowerCase() === "critical"
      );

      if (criticalFindings.length === 0) {
        return "There are currently no critical findings in your CloudShield environment.";
      }

      const details = criticalFindings
        .slice(0, 3)
        .map((finding) => {
          const resourceName =
            finding.resource?.name ||
            finding.resourceId;

          return `• ${finding.title} (${resourceName})`;
        })
        .join("\n");

      return `You currently have ${criticalFindings.length} critical finding(s). The most important ones are:\n\n${details}`;
    }

    if (
      query.includes("posture") ||
      query.includes("security score") ||
      query.includes("score")
    ) {
      return `Your current security score is ${securityData.score}/100. You have ${securityData.totalFindings} total finding(s), with ${securityData.critical} critical and ${securityData.high} high-severity findings. ${securityData.healthPercentage}% of your resources are currently healthy.`;
    }

    if (
      query.includes("remediate") ||
      query.includes("remediation") ||
      query.includes("fix")
    ) {
      const pendingActions = remediationActions.filter(
        (action) => {
          const status = action.status.toLowerCase();

          return (
            status === "pending" ||
            status === "open" ||
            status === "queued"
          );
        }
      );

      if (pendingActions.length === 0) {
        return "There are currently no pending remediation actions.";
      }

      const details = pendingActions
        .slice(0, 3)
        .map((action) => `• ${action.title}`)
        .join("\n");

      return `There are ${pendingActions.length} pending remediation action(s). Some of them are:\n\n${details}`;
    }

    if (
      query.includes("resource") ||
      query.includes("resources") ||
      query.includes("aws")
    ) {
      return `CloudShield is currently tracking ${securityData.resourcesTotal} resource(s). ${securityData.healthyResources} are healthy, giving an overall resource health of ${securityData.healthPercentage}%.`;
    }

    if (
      query.includes("improve") ||
      query.includes("improvement")
    ) {
      return `To improve your security score, focus first on critical and high-severity findings. You currently have ${securityData.critical} critical and ${securityData.high} high findings. Review the Remediation page for available corrective actions.`;
    }

    if (
      query.includes("hello") ||
      query.includes("hi") ||
      query.includes("hey")
    ) {
      return "Hello! I'm the CloudShield security assistant. I can currently analyze your security score, findings, resources, and remediation actions.";
    }

    return "I can currently help you analyze your security posture, critical risks, AWS resources, and remediation actions. Try asking: \"What are my most critical security risks?\"";
  };

  const handleSend = () => {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || loadingContext) {
      return;
    }

    const response = generateResponse(trimmedQuestion);

    setMessages((previous) => [
      ...previous,
      {
        id: Date.now(),
        role: "user",
        message: trimmedQuestion,
      },
      {
        id: Date.now() + 1,
        role: "assistant",
        message: response,
      },
    ]);

    setQuestion("");
  };

  const handleSuggestion = (text: string) => {
    setQuestion(text);

    if (!loadingContext) {
      const response = generateResponse(text);

      setMessages((previous) => [
        ...previous,
        {
          id: Date.now(),
          role: "user",
          message: text,
        },
        {
          id: Date.now() + 1,
          role: "assistant",
          message: response,
        },
      ]);

      setQuestion("");
    }
  };

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
                  {loadingContext
                    ? "Loading security context..."
                    : "Security assistant ready"}
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
          <div className="flex flex-1 flex-col px-6 py-8">
            {messages.length === 0 ? (
              <div className="flex flex-1 flex-col justify-center">
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
                    Ask about security findings, AWS resources, risk
                    reduction, or your current security score.
                  </p>

                  {/* Suggested Questions */}
                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    <SuggestionCard
                      icon={<ShieldAlert size={16} />}
                      text="What are my most critical security risks?"
                      onClick={handleSuggestion}
                    />

                    <SuggestionCard
                      icon={<MessageSquare size={16} />}
                      text="Explain my current security posture"
                      onClick={handleSuggestion}
                    />

                    <SuggestionCard
                      icon={<CheckCircle2 size={16} />}
                      text="Which findings should I remediate first?"
                      onClick={handleSuggestion}
                    />

                    <SuggestionCard
                      icon={<Sparkles size={16} />}
                      text="How can I improve my security score?"
                      onClick={handleSuggestion}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-6 ${
                        message.role === "user"
                          ? "bg-[#8B5CF6] text-white"
                          : "border border-white/10 bg-white/[0.03] text-gray-300"
                      }`}
                    >
                      {message.message}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-white/10 p-4">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-2.5 focus-within:border-[#8B5CF6]/40"
            >
              <input
                type="text"
                value={question}
                onChange={(event) =>
                  setQuestion(event.target.value)
                }
                placeholder="Ask CloudShield AI about your cloud security..."
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-600"
                disabled={loadingContext}
              />

              <button
                type="submit"
                disabled={
                  !question.trim() || loadingContext
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#8B5CF6] text-white transition hover:bg-[#7C3AED] disabled:cursor-not-allowed disabled:opacity-40"
                title="Send question"
              >
                <Send size={16} />
              </button>
            </form>

            <p className="mt-2 text-center text-[10px] text-gray-700">
              Responses are generated from your current CloudShield security data.
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
                value={
                  loadingContext
                    ? "Loading..."
                    : `${resources.length} resources`
                }
              />

              <ContextRow
                label="Findings"
                value={
                  loadingContext
                    ? "Loading..."
                    : `${findings.length} findings`
                }
              />

              <ContextRow
                label="Remediation"
                value={
                  loadingContext
                    ? "Loading..."
                    : `${remediationActions.length} actions`
                }
              />

              <ContextRow
                label="Posture"
                value={
                  loadingContext
                    ? "Loading..."
                    : securityData
                      ? `${securityData.score}/100`
                      : "Unavailable"
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
                  The assistant currently analyzes live CloudShield security
                  data. A dedicated LLM service can be connected later for
                  natural-language security analysis.
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
  icon: React.ReactNode;
  text: string;
  onClick: (text: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(text)}
      className="group flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left transition hover:border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/5"
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