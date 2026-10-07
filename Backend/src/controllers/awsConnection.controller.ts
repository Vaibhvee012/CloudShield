import { Response } from "express";
import { z } from "zod";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { assumeAWSRole } from "../services/awsConnectionService";

const connectAWSSchema = z.object({
  accountId: z
    .string()
    .regex(/^\d{12}$/, "AWS Account ID must be exactly 12 digits"),
  roleArn: z
    .string()
    .regex(
      /^arn:aws:iam::\d{12}:role\/[\w+=,.@-]+$/,
      "Invalid IAM Role ARN"
    ),
  region: z
    .string()
    .min(1, "AWS region is required"),
});

export const connectAWS = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const validation = connectAWSSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid AWS connection details",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const { accountId, roleArn, region } = validation.data;

    const identity = await assumeAWSRole({
      roleArn,
      region,
    });

    if (!identity.accountId) {
      return res.status(502).json({
        success: false,
        message: "AWS did not return an account identity",
      });
    }

    if (identity.accountId !== accountId) {
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
        lastSyncAt: null,
      },
      create: {
        userId: req.user.userId,
        accountId,
        roleArn,
        region,
        status: "CONNECTED",
      },
    });

    return res.status(200).json({
      success: true,
      message: "AWS account connected successfully",
      data: {
        id: connection.id,
        accountId: connection.accountId,
        roleArn: connection.roleArn,
        region: connection.region,
        status: connection.status,
      },
    });
  } catch (error) {
    console.error("AWS connection failed:", error);

    return res.status(400).json({
      success: false,
      message:
        "Unable to connect to AWS. Verify the IAM Role ARN and its trust permissions.",
    });
  }
};