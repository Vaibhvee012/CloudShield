import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import prisma from "../lib/prisma";
import { writeAudit, AuditAction } from "../lib/auditLog";

const getJWTSecret = (): string | null => {
  const secret = process.env.JWT_SECRET;
  return secret?.trim() ? secret : null;
};

// bcrypt only uses the first 72 bytes of a password.
const MAX_PASSWORD_BYTES = 72;

const registerSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  email: z
    .string({ error: "Email is required" })
    .trim()
    .toLowerCase()
    .max(254, "Email is too long")
    .pipe(z.email("Enter a valid email address")),
  password: z
    .string({ error: "Password is required" })
    .min(8, "Password must be at least 8 characters long")
    .refine(
      (value) => Buffer.byteLength(value, "utf8") <= MAX_PASSWORD_BYTES,
      `Password must be at most ${MAX_PASSWORD_BYTES} bytes long`,
    ),
});

const loginSchema = z.object({
  email: z
    .string({ error: "Email and password are required" })
    .trim()
    .toLowerCase()
    .min(1, "Email and password are required")
    .max(254, "Invalid email or password"),
  password: z
    .string({ error: "Email and password are required" })
    .min(1, "Email and password are required")
    .max(200, "Invalid email or password"),
});

export const register = async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body ?? {});

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message:
          parsed.error.issues[0]?.message ?? "Invalid registration details",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { name, email, password } = parsed.data;

    const secret = getJWTSecret();

    if (!secret) {
      console.error("JWT_SECRET is not configured");
      return res.status(500).json({
        success: false,
        message: "Server authentication configuration is missing",
      });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });

    if (existingUser) {
      // The attempted email is deliberately not stored.
      await writeAudit({
        action: AuditAction.AUTH_REGISTER,
        outcome: "FAILURE",
        metadata: { reason: "email_already_registered" },
        ip: req.ip,
      });

      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "VIEWER",
      },
    });

    await writeAudit({
      userId: user.id,
      action: AuditAction.AUTH_REGISTER,
      outcome: "SUCCESS",
      targetType: "User",
      targetId: user.id,
      ip: req.ip,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration failed:", error);

    await writeAudit({
      action: AuditAction.AUTH_REGISTER,
      outcome: "FAILURE",
      metadata: { reason: "server_error" },
      ip: req.ip,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to register user",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body ?? {});

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message:
          parsed.error.issues[0]?.message ?? "Email and password are required",
      });
    }

    const { email, password } = parsed.data;

    const secret = getJWTSecret();

    if (!secret) {
      console.error("JWT_SECRET is not configured");
      return res.status(500).json({
        success: false,
        message: "Server authentication configuration is missing",
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });

    if (!user) {
      // Unknown email: no user to attach to, and the email is not stored.
      await writeAudit({
        action: AuditAction.AUTH_LOGIN,
        outcome: "FAILURE",
        metadata: { reason: "unknown_email" },
        ip: req.ip,
      });

      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      // Attached to the account being attacked, so its owner can see it.
      await writeAudit({
        userId: user.id,
        action: AuditAction.AUTH_LOGIN,
        outcome: "FAILURE",
        metadata: { reason: "bad_password" },
        ip: req.ip,
      });

      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      secret,
      { expiresIn: "1d" }
    );

    await writeAudit({
      userId: user.id,
      action: AuditAction.AUTH_LOGIN,
      outcome: "SUCCESS",
      targetType: "User",
      targetId: user.id,
      ip: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Login failed:", error);

    await writeAudit({
      action: AuditAction.AUTH_LOGIN,
      outcome: "FAILURE",
      metadata: { reason: "server_error" },
      ip: req.ip,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to login",
    });
  }
};
