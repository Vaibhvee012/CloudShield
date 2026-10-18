import { Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest, requireUserId } from "../middleware/auth.middleware";
import { ownedRemediations } from "../lib/ownership";

export const getRemediationActions = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const remediationActions =
      await prisma.remediationAction.findMany({
        where: ownedRemediations(userId),
        orderBy: {
          createdAt: "desc",
        },
        include: {
          finding: {
            include: {
              resource: true,
            },
          },
        },
      });

    res.json({
      success: true,
      count: remediationActions.length,
      data: remediationActions,
    });
  } catch (error) {
    console.error(
      "Failed to fetch remediation actions:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch remediation actions",
    });
  }
};