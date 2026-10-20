import { Response } from "express";
import { z } from "zod";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { assumeAWSRole } from "../services/awsConnectionService";
import { audit, AuditAction } from "../lib/auditLog";

const connectAWSSchema = z.object({
  accountId: z.string().regex(
    /^\d{12}$/,
    "AWS Account ID must be exactly 12 digits"
  ),
  roleArn: z.string().regex(
    /^arn:aws:iam::\d{12}:role\/[\w+=,.@-]+$/,
    "Invalid IAM Role ARN"
  ),
  region: z.string().trim().min(1, "AWS region is required"),
});

export const connectAWS = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const validation = connectAWSSchema.safeParse(req.body);

    if (!validation.success) {
      await audit(req, AuditAction.AWS_CONNECT, "FAILURE", {
        targetType: "AWSConnection",
        metadata: { reason: "validation_failed" },
      });

      return res.status(400).json({
        success: false,
        message: "Invalid AWS connection details",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const { accountId, roleArn, region } = validation.data;

    // Verify AWS access before saving the connection.
    const identity = await assumeAWSRole({ roleArn, region });

    if (!identity.accountId) {
      await audit(req, AuditAction.AWS_CONNECT, "FAILURE", {
        targetType: "AWSConnection",
        metadata: { reason: "no_account_identity", region },
      });

      return res.status(502).json({
        success: false,
        message: "AWS did not return an account identity",
      });
    }

    if (identity.accountId !== accountId) {
      await audit(req, AuditAction.AWS_CONNECT, "FAILURE", {
        targetType: "AWSConnection",
        metadata: { reason: "account_id_mismatch", region },
      });

      return res.status(400).json({
        success: false,
        message:
          "The AWS Account ID does not match the account associated with the IAM Role",
      });
    }

    const connection = await prisma.aWSConnection.upsert({
      where: {
        userId_accountId: {
          userId: req.user.userId,
          accountId,
        },
      },
      update: {
        roleArn,
        region,
        status: "CONNECTED",
      },
      create: {
        userId: req.user.userId,
        accountId,
        roleArn,
        region,
        status: "CONNECTED",
      },
    });

    // Never store the role ARN. Only the last 4 digits of the account ID.
    await audit(req, AuditAction.AWS_CONNECT, "SUCCESS", {
      targetType: "AWSConnection",
      targetId: connection.id,
      metadata: {
        region,
        accountSuffix: accountId.slice(-4),
      },
    });

    return res.status(200).json({
      success: true,
      message: "AWS account connected successfully",
      data: {
        id: connection.id,
        accountId: connection.accountId,
        region: connection.region,
        status: connection.status,
        lastSyncAt: connection.lastSyncAt,
      },
    });
  } catch (error) {
    console.error("AWS connection failed:", error);

    await audit(req, AuditAction.AWS_CONNECT, "FAILURE", {
      targetType: "AWSConnection",
      metadata: { reason: "aws_connection_failed" },
    });

    return res.status(500).json({
      success: false,
      message:
        "Unable to connect to AWS. Verify the IAM Role ARN and its trust permissions.",
    });
  }
};