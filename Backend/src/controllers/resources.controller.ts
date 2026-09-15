import { Request, Response } from "express";
import { resources } from "../data/resources.data";

export const getResources = (_req: Request, res: Response) => {
  res.json({
    success: true,
    count: resources.length,
    data: resources,
  });
};