import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

const unauthorized = (res: Response) =>
  res.status(401).json({
    success: false,
    message: "Invalid or expired token",
  });

/*
 * Verifies the token, then checks the user still exists.
 * The role comes from the database, not the token, so a deleted user or a
 * role change takes effect immediately instead of when the token expires.
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication token is required",
    });
  }

  const token = authHeader.slice("Bearer ".length).trim();

  let userId: string;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    if (typeof decoded === "string" || typeof decoded.userId !== "string") {
      throw new Error("Malformed token payload");
    }

    userId = decoded.userId;
  } catch (error) {
    // Name only: no stack traces or token data in the logs.
    console.warn(
      "Rejected token:",
      error instanceof Error ? error.name : "unknown"
    );

    return unauthorized(res);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      return unauthorized(res);
    }

    req.user = {
      userId: user.id,
      role: String(user.role),
    };

    return next();
  } catch (error) {
    console.error("Authentication lookup failed:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to verify authentication",
    });
  }
};

export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource",
      });
    }

    next();
  };
};

export const requireUserId = (
  req: AuthRequest,
  res: Response
): string | null => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return null;
  }

  return userId;
};
