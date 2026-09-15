import { Request, Response } from "express";
import prisma from "../lib/prisma";

export const getResources = async (_req: Request, res: Response) => {
  try {
    const resources = await prisma.resource.findMany({
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