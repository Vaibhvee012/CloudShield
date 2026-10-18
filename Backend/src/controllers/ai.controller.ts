import { Response } from "express";
import {
  buildSecurityContext,
} from "../services/aiContextService";
import { generateAIResponse } from "../services/geminiService";
import {
  buildChatPrompt,
  buildDashboardPrompt,
} from "../services/aiPrompts";
import prisma from "../lib/prisma";
import { AuthRequest, requireUserId } from "../middleware/auth.middleware";
import { ownedFindings } from "../lib/ownership";
import { sendAIError } from "../lib/aiErrors";
import {
  UNTRUSTED_DATA_RULE,
  parseResourceId,
  sanitizeText,
  severityRank,
} from "../lib/promptSafety";

const MAX_PRIORITIZED_FINDINGS = 25;
const MAX_FINDINGS_SCANNED = 200;
const ADVISORY_NOTICE =
  "Advisory only. CloudShield does not change your AWS resources. Review suggestions before applying them.";

export const chatWithAI = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const { question } = req.body;

    if (!question || typeof question !== "string") {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    const trimmedQuestion = question.trim();

    if (trimmedQuestion.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Question cannot be empty",
      });
    }

    if (trimmedQuestion.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Question must be 2000 characters or less",
      });
    }

    const securityContext = await buildSecurityContext(userId);

    const prompt = buildChatPrompt(
      trimmedQuestion,
      securityContext
    );

    const response = await generateAIResponse(prompt);

    return res.status(200).json({
      success: true,
      data: {
        response,
      },
    });
  } catch (error) {
    console.error("CloudShield AI chat error:", error);

    return sendAIError(
      res,
      error,
      "Failed to generate AI response"
    );
  }
};

export const explainFinding = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;
    

    const id = parseResourceId(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "A valid finding ID is required",
      });
    }

    // Ownership is enforced in the query itself.
    const finding = await prisma.finding.findFirst({
      where: {
        id,
        ...ownedFindings(userId),
      },
      include: {
        resource: true,
        remediation: true,
      },
    });

    if (!finding) {
      return res.status(404).json({
        success: false,
        message: "Finding not found",
      });
    }

    const remediation = finding.remediation;

    const prompt = `
You are CloudShield AI, a cloud security expert.

Explain the following AWS security finding to a CloudShield user.

${UNTRUSTED_DATA_RULE}

<data>
Finding:
- Title: ${sanitizeText(finding.title, 200)}
- Severity: ${sanitizeText(finding.severity, 20)}
- Category: ${sanitizeText(finding.category, 100)}
- Description: ${sanitizeText(finding.description, 800)}
- Resource: ${sanitizeText(finding.resource?.name ?? "Unknown resource", 200)}
- Resource Type: ${sanitizeText(finding.resourceType, 50)}
- Region: ${sanitizeText(finding.region, 50)}
- Status: ${sanitizeText(finding.status, 30)}

Existing remediation:
${
  remediation
    ? `${sanitizeText(remediation.title, 200)}: ${sanitizeText(remediation.action, 800)}`
    : "No remediation action is currently available."
}
</data>

Explain:
1. Why this finding is a security risk.
2. What could happen if it remains unresolved.
3. Why its severity level is appropriate.
4. What the recommended remediation should accomplish.
5. One practical next step.

Rules:
- Do not invent information about the resource.
- Do not claim that you changed anything.
- Keep the explanation practical and easy to understand.
- Base the explanation only on the finding information provided.
`;

    const response = await generateAIResponse(prompt);

    return res.status(200).json({
      success: true,
      data: {
        findingId: finding.id,
        explanation: response,
      },
    });
  } catch (error) {
    console.error(
      "CloudShield AI finding explanation error:",
      error
    );

    return sendAIError(res, error, "Failed to explain finding");
  }
};

export const prioritizeRisks = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const openWhere = {
      ...ownedFindings(userId),
      status: { not: "RESOLVED" },
    };

    const [totalOpen, scannedFindings] = await Promise.all([
      prisma.finding.count({ where: openWhere }),
      prisma.finding.findMany({
        where: openWhere,
        orderBy: { updatedAt: "desc" },
        take: MAX_FINDINGS_SCANNED,
      }),
    ]);

    if (totalOpen === 0) {
      return res.status(200).json({
        success: true,
        data: {
          prioritization:
            "There are currently no open security findings to prioritize.",
          totalOpen: 0,
          analyzed: 0,
        },
      });
    }

    // Most severe first, then cap what is sent to the model.
    const findings = [...scannedFindings]
      .sort(
        (a, b) =>
          severityRank(a.severity) - severityRank(b.severity)
      )
      .slice(0, MAX_PRIORITIZED_FINDINGS);

    const prompt = `
You are CloudShield AI, a cloud security risk prioritization engine.

Analyze the following active AWS security findings and determine what the
CloudShield user should fix first.

${UNTRUSTED_DATA_RULE}

There are ${totalOpen} open findings in total. The ${findings.length} most
severe are listed below.

<data>
${JSON.stringify(
  findings.map((finding) => ({
    id: finding.id,
    title: sanitizeText(finding.title, 200),
    severity: sanitizeText(finding.severity, 20),
    resourceId: sanitizeText(finding.resourceId, 200),
    resourceType: sanitizeText(finding.resourceType, 50),
    region: sanitizeText(finding.region, 50),
    category: sanitizeText(finding.category, 100),
    status: sanitizeText(finding.status, 30),
    description: sanitizeText(finding.description, 500),
  })),
  null,
  2
)}
</data>

For each prioritized finding provide:
1. Priority rank.
2. Finding title.
3. Severity.
4. Why it should be prioritized.
5. Potential security impact.
6. Recommended next action.

Prioritization rules:
- CRITICAL findings should generally come first.
- HIGH findings should generally come next.
- Consider potential data exposure, unauthorized access, internet exposure,
  privilege escalation, and attack surface.
- Do not invent information that is not present in the findings.
- Do not claim that any remediation has been performed.
- Keep the output concise and actionable.
`;

    const response = await generateAIResponse(prompt);

    return res.status(200).json({
      success: true,
      data: {
        prioritization: response,
        totalOpen,
        analyzed: findings.length,
      },
    });
  } catch (error) {
    console.error(
      "CloudShield AI risk prioritization error:",
      error
    );

    return sendAIError(
      res,
      error,
      "Failed to prioritize security risks"
    );
  }
};

export const suggestRemediation = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const id = parseResourceId(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "A valid finding ID is required",
      });
    }

    // Ownership is enforced in the query itself.
    const finding = await prisma.finding.findFirst({
      where: {
        id,
        ...ownedFindings(userId),
      },
      include: {
        resource: true,
        remediation: true,
      },
    });

    if (!finding) {
      return res.status(404).json({
        success: false,
        message: "Finding not found",
      });
    }

    const existingRemediation = finding.remediation;

    const prompt = `
You are CloudShield AI, an AWS cloud security remediation advisor.

Create a practical remediation plan for the following security finding.
This is advice only. CloudShield does not change AWS resources.

${UNTRUSTED_DATA_RULE}

<data>
Finding:
- Title: ${sanitizeText(finding.title, 200)}
- Severity: ${sanitizeText(finding.severity, 20)}
- Category: ${sanitizeText(finding.category, 100)}
- Description: ${sanitizeText(finding.description, 800)}
- Resource: ${sanitizeText(finding.resource?.name ?? "Unknown resource", 200)}
- Resource Type: ${sanitizeText(finding.resourceType, 50)}
- Region: ${sanitizeText(finding.region, 50)}
- Status: ${sanitizeText(finding.status, 30)}

Existing remediation:
${
  existingRemediation
    ? `${sanitizeText(existingRemediation.title, 200)}: ${sanitizeText(existingRemediation.action, 800)}`
    : "No existing remediation is available."
}
</data>

Provide:

1. Recommended remediation
2. Step-by-step actions
3. AWS service or configuration involved
4. Expected security improvement
5. Important caution before applying the change
6. How to verify that the issue is fixed

Rules:
- Do not claim that you performed the remediation.
- Do not invent AWS configuration details.
- Do not provide credentials, secrets, or destructive commands.
- Prefer safe, reversible actions where possible.
- Base the recommendation only on the finding information provided.
- Keep the response practical and concise.
`;

    const response = await generateAIResponse(prompt);

    return res.status(200).json({
      success: true,
      data: {
        findingId: finding.id,
        remediation: response,
      },
    });
  } catch (error) {
    console.error(
      "CloudShield AI remediation suggestion error:",
      error
    );

    return sendAIError(
      res,
      error,
      "Failed to generate remediation suggestion"
    );
  }
};

export const getDashboardInsight = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const securityContext = await buildSecurityContext(userId);

    const prompt = buildDashboardPrompt(securityContext);

    const response = await generateAIResponse(prompt);

    return res.status(200).json({
      success: true,
      data: {
        insight: response,
      },
    });
  } catch (error) {
    console.error(
      "CloudShield AI dashboard insight error:",
      error
    );

    return sendAIError(
      res,
      error,
      "Failed to generate dashboard AI insight"
    );
  }
};