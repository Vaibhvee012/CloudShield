import { Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest, requireUserId } from "../middleware/auth.middleware";
import { ownedFindings } from "../lib/ownership";

export const getFindings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const findings = await prisma.finding.findMany({
      where: ownedFindings(userId),
      include: {
        resource: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      count: findings.length,
      data: findings,
    });
  } catch (error) {
    console.error("Failed to fetch findings:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch findings",
    });
  }
};