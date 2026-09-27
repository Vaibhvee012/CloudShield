import { Request, Response } from "express";
import prisma from "../lib/prisma";

export const getRemediationActions = async (
  _req: Request,
  res: Response
) => {
  try {
    const remediationActions = await prisma.remediationAction.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      count: remediationActions.length,
      data: remediationActions,
    });
  } catch (error) {
    console.error("Failed to fetch remediation actions:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch remediation actions",
    });
  }
};