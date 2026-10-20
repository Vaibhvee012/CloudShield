import prisma from "./prisma";
import type { AuthRequest } from "../middleware/auth.middleware";

export type AuditOutcome = "SUCCESS" | "FAILURE" | "DENIED";

export const AuditAction = {
  AI_CHAT: "AI_CHAT",
  AI_EXPLAIN_FINDING: "AI_EXPLAIN_FINDING",
  AI_PRIORITIZE_RISKS: "AI_PRIORITIZE_RISKS",
  AI_SUGGEST_REMEDIATION: "AI_SUGGEST_REMEDIATION",
  AI_DASHBOARD_INSIGHT: "AI_DASHBOARD_INSIGHT",
  AWS_CONNECT: "AWS_CONNECT",
  AWS_SYNC: "AWS_SYNC",
  AWS_DISCONNECT: "AWS_DISCONNECT",
  AUTH_LOGIN: "AUTH_LOGIN",
  AUTH_REGISTER: "AUTH_REGISTER",
  ACCESS_DENIED: "ACCESS_DENIED",
} as const;

export type AuditMetadata = Record<string, string | number | boolean | null>;

type AuditEntry = {
  userId?: string | null;
  action: string;
  outcome: AuditOutcome;
  targetType?: string;
  targetId?: string;
  metadata?: AuditMetadata;
  ip?: string;
};

const clip = (value: string | undefined, max: number) =>
  value === undefined ? undefined : value.slice(0, max);

// Audit logging must never break the request that triggered it.
// Never put prompts, AI responses, tokens, passwords or role ARNs in metadata.
export const writeAudit = async (entry: AuditEntry): Promise<void> => {
  try {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId ?? null,
        action: entry.action,
        outcome: entry.outcome,
        targetType: clip(entry.targetType, 50),
        targetId: clip(entry.targetId, 200),
        metadata: entry.metadata,
        ip: clip(entry.ip, 64),
      },
    });
  } catch (error) {
    console.error(
      "Audit log write failed:",
      error instanceof Error ? error.message : "unknown error"
    );
  }
};

// Shortcut for authenticated requests: fills in the user and IP.
export const audit = async (
  req: AuthRequest,
  action: string,
  outcome: AuditOutcome,
  details: {
    targetType?: string;
    targetId?: string;
    metadata?: AuditMetadata;
  } = {}
): Promise<void> =>
  writeAudit({
    userId: req.user?.userId,
    action,
    outcome,
    ip: req.ip,
    ...details,
  });