
import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { connectAWS } from "../controllers/awsConnection.controller";
import {
  authenticate,
  AuthRequest,
} from "../middleware/auth.middleware";
import { syncUserAWSSecurityFindings } from "../services/awsFindingPersistence";

const router = Router();

router.use(authenticate);

// Connect an AWS account.
router.post("/connect", connectAWS);

// List the signed-in user's AWS connections.
router.get("/connections", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const connections = await prisma.aWSConnection.findMany({
      where: { userId: req.user.userId },
      select: {
        id: true,
        accountId: true,
        region: true,
        status: true,
        lastSyncAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      success: true,
      data: connections,
    });
  } catch (error) {
    console.error("AWS connections fetch failed:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch AWS connections",
    });
  }
});

// List resources belonging only to the signed-in user's connections.
router.get("/resources", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const resources = await prisma.resource.findMany({
      where: {
        awsConnection: {
          userId: req.user.userId,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return res.json({
      success: true,
      data: resources,
      count: resources.length,
    });
  } catch (error) {
    console.error("AWS resources fetch failed:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch AWS resources",
    });
  }
});

// List findings belonging only to the signed-in user's connections.
router.get("/findings", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const findings = await prisma.finding.findMany({
      where: {
        awsConnection: {
          userId: req.user.userId,
        },
      },
      include: {
        remediation: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    return res.json({
      success: true,
      data: findings,
      count: findings.length,
    });
  } catch (error) {
    console.error("AWS findings fetch failed:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch AWS findings",
    });
  }
});

// Calculate a project-defined security score for this user's AWS resources.
router.get("/security/score", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const connections = await prisma.aWSConnection.findMany({
      where: { userId: req.user.userId },
      select: { id: true },
    });

    const connectionIds = connections.map((connection) => connection.id);

    if (connectionIds.length === 0) {
      return res.json({
        success: true,
        connected: false,
        score: null,
        resources: 0,
        findings: 0,
        openFindings: 0,
        severity: {
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
        },
      });
    }

    const [resources, findings] = await Promise.all([
      prisma.resource.count({
        where: {
          awsConnectionId: { in: connectionIds },
          status: { not: "disconnected" },
        },
      }),
      prisma.finding.findMany({
        where: {
          awsConnectionId: { in: connectionIds },
        },
        select: {
          severity: true,
          status: true,
        },
      }),
    ]);

    const openFindings = findings.filter(
      (finding) => finding.status === "OPEN"
    );

    const severity = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    for (const finding of openFindings) {
      switch (finding.severity.toUpperCase()) {
        case "CRITICAL":
          severity.critical++;
          break;
        case "HIGH":
          severity.high++;
          break;
        case "MEDIUM":
          severity.medium++;
          break;
        case "LOW":
          severity.low++;
          break;
      }
    }

    const deductions =
      severity.critical * 20 +
      severity.high * 10 +
      severity.medium * 5 +
      severity.low * 2;

    const score =
      resources === 0
        ? null
        : Math.max(0, Math.min(100, 100 - deductions));

    return res.json({
      success: true,
      connected: true,
      score,
      resources,
      findings: findings.length,
      openFindings: openFindings.length,
      severity,
      scoringModel: "PROJECT_DEFINED",
    });
  } catch (error) {
    console.error("Failed to calculate security score:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to calculate security score",
    });
  }
});

// Sync one connection, after verifying ownership.
router.post(
  "/connections/:connectionId/sync",
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const connectionId = req.params.connectionId;

      if (typeof connectionId !== "string" || !connectionId.trim()) {
        return res.status(400).json({
          success: false,
          message: "Invalid AWS connection ID",
        });
      }

      const connection = await prisma.aWSConnection.findFirst({
        where: {
          id: connectionId,
          userId: req.user.userId,
        },
      });

      if (!connection) {
        return res.status(404).json({
          success: false,
          message: "AWS connection not found",
        });
      }

      const findings =
        await syncUserAWSSecurityFindings(connectionId);

      const resources = await prisma.resource.findMany({
        where: {
          awsConnectionId: connectionId,
          status: { not: "disconnected" },
        },
        orderBy: { updatedAt: "desc" },
      });

      const updatedConnection = await prisma.aWSConnection.findUnique({
        where: { id: connectionId },
        select: { lastSyncAt: true },
      });

      return res.json({
        success: true,
        message: "AWS resources and security findings synced successfully",
        data: {
          resources,
          findings,
        },
        counts: {
          resources: resources.length,
          findings: findings.length,
        },
        lastSyncedAt: updatedConnection?.lastSyncAt ?? null,
      });
    } catch (error) {
      console.error("User AWS sync failed:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to sync AWS resources and security findings",
      });
    }
  }
);

// Disconnect only a connection owned by the signed-in user.
router.delete(
  "/connections/:connectionId",
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const connectionId = req.params.connectionId;

      if (typeof connectionId !== "string" || !connectionId.trim()) {
        return res.status(400).json({
          success: false,
          message: "Invalid AWS connection ID",
        });
      }

      const connection = await prisma.aWSConnection.findFirst({
        where: {
          id: connectionId,
          userId: req.user.userId,
        },
        select: { id: true },
      });

      if (!connection) {
        return res.status(404).json({
          success: false,
          message: "AWS connection not found",
        });
      }

      await prisma.aWSConnection.delete({
        where: { id: connection.id },
      });

      return res.json({
        success: true,
        message: "AWS connection disconnected successfully",
      });
    } catch (error) {
      console.error("AWS disconnect failed:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to disconnect AWS account",
      });
    }
  }
);

export default router;
