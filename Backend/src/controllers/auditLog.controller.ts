import { Response } from "express";
import { z } from "zod";
import prisma from "../lib/prisma";
import { AuthRequest, requireUserId } from "../middleware/auth.middleware";
import { AuditAction } from "../lib/auditLog";

const actionValues = Object.values(AuditAction) as [string, ...string[]];

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(25),
  cursor: z.string().trim().min(1).max(100).optional(),
  action: z.enum(actionValues).optional(),
  outcome: z.enum(["SUCCESS", "FAILURE", "DENIED"]).optional(),
});

export const getAuditLogs = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const parsed = querySchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid audit log query",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { limit, cursor, action, outcome } = parsed.data;

    // The userId filter is always applied: users only ever see their own events.
    const rows = await prisma.auditLog.findMany({
      where: {
        userId,
        ...(action ? { action } : {}),
        ...(outcome ? { outcome } : {}),
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: {
        id: true,
        createdAt: true,
        action: true,
        outcome: true,
        targetType: true,
        targetId: true,
        metadata: true,
        ip: true,
      },
    });

    const hasMore = rows.length > limit;
    const data = rows.slice(0, limit);

    return res.json({
      success: true,
      count: data.length,
      data,
      nextCursor: hasMore ? data[data.length - 1].id : null,
    });
  } catch (error) {
    console.error("Failed to fetch audit logs:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch audit logs",
    });
  }
};