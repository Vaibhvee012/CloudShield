import { Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest, requireUserId } from "../middleware/auth.middleware";
import { buildSecurityContext } from "../services/aiContextService";
import { buildDashboardPrompt } from "../services/aiPrompts";
import { generateAIResponse } from "../services/geminiService";
import { sendAIError } from "../lib/aiErrors";
import { getCachedInsight, setCachedInsight } from "../lib/insightCache";

export const getDashboardInsight = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    // State 1: no AWS connection, so there is nothing to analyze.
    const connectionCount = await prisma.aWSConnection.count({
      where: { userId },
    });

    if (connectionCount === 0) {
      return res.status(200).json({
        success: true,
        data: {
          state: "NO_CONNECTION",
          insight: "Connect an AWS account to get AI security insights.",
        },
      });
    }

    const securityContext = await buildSecurityContext(userId);

    // State 2: connected, but nothing synced yet.
    if (
      securityContext.summary.totalResources === 0 &&
      securityContext.summary.totalOpenFindings === 0
    ) {
      return res.status(200).json({
        success: true,
        data: {
          state: "NO_DATA",
          insight:
            "Your AWS account is connected, but no resources have been synced yet. Run a sync to get AI security insights.",
        },
      });
    }

    // State 3: real data. Reuse a recent insight if nothing has changed.
    const fingerprint = JSON.stringify({
      summary: securityContext.summary,
      findingIds: securityContext.findings.map((finding) => finding.id),
    });

    const forceRefresh = req.query.refresh === "1";

    if (!forceRefresh) {
      const cached = getCachedInsight(userId, fingerprint);

      if (cached) {
        return res.status(200).json({
          success: true,
          data: {
            state: "CACHED",
            insight: cached,
          },
        });
      }
    }

    const prompt = buildDashboardPrompt(securityContext);
    const insight = await generateAIResponse(prompt);

    setCachedInsight(userId, fingerprint, insight);

    return res.status(200).json({
      success: true,
      data: {
        state: "READY",
        insight,
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