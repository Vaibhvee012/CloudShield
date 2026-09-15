import { Request, Response } from "express";
import prisma from "../lib/prisma";

export const getFindings = async (_req: Request, res: Response) => {
  try {
    const findings = await prisma.finding.findMany({
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