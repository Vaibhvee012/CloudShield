import { Request, Response } from "express";
import { remediationActions } from "../data/remediation.data";

export const getRemediationActions = (_req: Request, res: Response) => {
  res.json({
    success: true,
    count: remediationActions.length,
    data: remediationActions,
  });
};