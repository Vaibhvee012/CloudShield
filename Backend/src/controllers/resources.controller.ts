import { Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest, requireUserId } from "../middleware/auth.middleware";
import { ownedResources } from "../lib/ownership";

export const getResources = async (req: AuthRequest, res: Response) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const resources = await prisma.resource.findMany({
      where: ownedResources(userId),
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      count: resources.length,
      data: resources,
    });
  } catch (error) {
    console.error("Failed to fetch resources:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch resources",
    });
  }
};