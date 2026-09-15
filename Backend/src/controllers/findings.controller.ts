import { Request, Response } from "express";
import { findings } from "../data/findings.data";

export const getFindings = (_req: Request, res: Response) => {
  res.json({
    success: true,
    count: findings.length,
    data: findings,
  });
};