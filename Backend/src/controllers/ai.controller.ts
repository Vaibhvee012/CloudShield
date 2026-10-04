import { Request, Response } from "express";
import {
  buildSecurityContext,
} from "../services/aiContextService";
import {
  buildCloudShieldPrompt,
  generateAIResponse,
} from "../services/geminiService";
import prisma from "../lib/prisma";


export const chatWithAI = async (
  req: Request,
  res: Response
) => {
  try {
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

    const securityContext = await buildSecurityContext();

    const prompt = buildCloudShieldPrompt(
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
    console.error("CloudShield AI error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate AI response",
    });
  }
};


export const explainFinding = async (
  req: Request,
  res: Response
) => {
  try {
    const id = String(req.params.id);

    const finding = await prisma.finding.findUnique({
      where: {
        id,
      },
    });

    if (!finding) {
      return res.status(404).json({
        success: false,
        message: "Finding not found",
      });
    }

    const resource = await prisma.resource.findUnique({
      where: {
        id: finding.resourceId,
      },
    });

    const remediation = await prisma.remediationAction.findUnique({
      where: {
        findingId: finding.id,
      },
    });

    const prompt = `
You are CloudShield AI, a cloud security expert.

Explain the following AWS security finding to a CloudShield user.

Finding:
- Title: ${finding.title}
- Severity: ${finding.severity}
- Category: ${finding.category}
- Description: ${finding.description}
- Resource: ${resource?.name ?? "Unknown resource"}
- Resource Type: ${finding.resourceType}
- Region: ${finding.region}
- Status: ${finding.status}

Existing remediation:
${
  remediation
    ? `${remediation.title}: ${remediation.action}`
    : "No remediation action is currently available."
}

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

    return res.status(500).json({
      success: false,
      message: "Failed to explain finding",
    });
  }
};

export const prioritizeRisks = async (
  _req: Request,
  res: Response
) => {
  try {
    const findings = await prisma.finding.findMany({
      where: {
        status: {
          not: "RESOLVED",
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    if (findings.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          prioritization:
            "There are currently no open security findings to prioritize.",
        },
      });
    }

    const prompt = `
You are CloudShield AI, a cloud security risk prioritization engine.

Analyze the following active AWS security findings and determine what the
CloudShield user should fix first.

ACTIVE FINDINGS:
${JSON.stringify(
  findings.map((finding) => ({
    id: finding.id,
    title: finding.title,
    severity: finding.severity,
    resourceId: finding.resourceId,
    resourceType: finding.resourceType,
    region: finding.region,
    category: finding.category,
    status: finding.status,
    description: finding.description,
  })),
  null,
  2
)}

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
      },
    });
  } catch (error) {
    console.error(
      "CloudShield AI risk prioritization error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to prioritize security risks",
    });
  }
};

export const suggestRemediation = async (
  req: Request,
  res: Response
) => {
  try {
    const id = String(req.params.id);

    const finding = await prisma.finding.findUnique({
      where: {
        id,
      },
    });

    if (!finding) {
      return res.status(404).json({
        success: false,
        message: "Finding not found",
      });
    }

    const resource = await prisma.resource.findUnique({
      where: {
        id: finding.resourceId,
      },
    });

    const existingRemediation =
      await prisma.remediationAction.findUnique({
        where: {
          findingId: finding.id,
        },
      });

    const prompt = `
You are CloudShield AI, an AWS cloud security remediation advisor.

Create a practical remediation plan for the following security finding.

Finding:
- Title: ${finding.title}
- Severity: ${finding.severity}
- Category: ${finding.category}
- Description: ${finding.description}
- Resource: ${resource?.name ?? "Unknown resource"}
- Resource Type: ${finding.resourceType}
- Region: ${finding.region}
- Status: ${finding.status}

Existing rchatWithAIemediation:
${
  existingRemediation
    ? `${existingRemediation.title}: ${existingRemediation.action}`
    : "No existing remediation is available."
}

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

    return res.status(500).json({
      success: false,
      message: "Failed to generate remediation suggestion",
    });
  }
};

export const getDashboardInsight = async (
  _req: Request,
  res: Response
) => {
  try {
    const securityContext = await buildSecurityContext();

    const prompt = `
You are CloudShield AI, an AWS cloud security analyst.

Generate one concise security insight for the CloudShield dashboard based
ONLY on the security data provided below.

CloudShield Security Context:
${JSON.stringify(securityContext, null, 2)}

Your response must contain:

1. A short insight headline.
2. The most important security issue right now.
3. Why it matters.
4. One recommended action.

Rules:
- Prioritize CRITICAL and HIGH findings.
- Use actual findings and resources from the provided context.
- Do not invent information.
- Do not claim that any AWS changes have been performed.
- Keep the response concise enough for a dashboard card.
- Do not use markdown tables.
`;

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

    return res.status(500).json({
      success: false,
      message: "Failed to generate dashboard AI insight",
    });
  }
};