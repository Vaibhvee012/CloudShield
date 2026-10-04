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

    const securityContext = await buildSecurityContext();

    const prompt = buildCloudShieldPrompt(
      question,
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