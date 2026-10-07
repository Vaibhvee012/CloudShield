import { Router } from "express";
import { connectAWS } from "../controllers/awsConnection.controller";
import { authenticate } from "../middleware/auth.middleware";
import { getAWSAccountIdentity } from "../services/awsService";
import { getEC2Instances } from "../services/ec2Service";
import { getS3Buckets } from "../services/s3Service";
import { getRDSInstances } from "../services/rdsService";
import { discoverAWSResources } from "../services/awsResourceService";
import { syncAWSResources } from "../services/awsResourcePersistence";
import { checkS3PublicAccess } from "../services/s3SecurityService";
import { scanS3Security } from "../services/s3SecurityService";
import { syncS3SecurityFindings } from "../services/securityFindingService";
import { scanAWSSecurity } from "../services/securityScanner";
import { syncAWSSecurityFindings } from "../services/awsFindingPersistence";
import prisma from "../lib/prisma";

const router = Router();
router.post("/connect", authenticate, connectAWS);

router.get("/identity", async (_req, res) => {
  try {
    const identity = await getAWSAccountIdentity();

    res.json({
      success: true,
      data: identity,
    });
  } catch (error) {
    console.error("AWS identity error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to connect to AWS",
    });
  }
});


router.get("/ec2", async (_req, res) => {
  try {
    const instances = await getEC2Instances();

    res.json({
      success: true,
      data: instances,
    });
  } catch (error) {
    console.error("EC2 discovery error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to discover EC2 instances",
    });
  }
});

router.get("/s3", async (_req, res) => {
  try {
    const buckets = await getS3Buckets();

    res.json({
      success: true,
      data: buckets,
    });
  } catch (error) {
    console.error("S3 discovery error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to discover S3 buckets",
    });
  }
});

router.get("/rds", async (_req, res) => {
  try {
    const instances = await getRDSInstances();

    res.json({
      success: true,
      data: instances,
    });
  } catch (error) {
    console.error("RDS discovery error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to discover RDS instances",
    });
  }
});


router.get("/resources", async (_req, res) => {
  try {
    const resources = await discoverAWSResources();

    res.json({
      success: true,
      data: resources,
    });
  } catch (error) {
    console.error("AWS resource discovery error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to discover AWS resources",
    });
  }
});

router.post("/sync", async (_req, res) => {
  try {
    const resources = await syncAWSResources();

    res.json({
      success: true,
      message: "AWS resources synced successfully",
      data: resources,
    });
  } catch (error) {
    console.error("AWS resource sync error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to sync AWS resources",
    });
  }
});



router.get("/security/s3", async (req, res) => {
  try {
    const bucketName =
      "aws-sam-cli-managed-default-samclisourcebucket-zmoh9fqnfqu5";

    const result = await checkS3PublicAccess(bucketName);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("S3 security scan failed:", error);

    res.status(500).json({
      success: false,
      message: "Failed to scan S3 bucket",
    });
  }
});


router.get("/security/s3/scan", async (req, res) => {
  try {
    const results = await scanS3Security();

    res.json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error("S3 security scan failed:", error);

    res.status(500).json({
      success: false,
      message: "Failed to scan S3 buckets",
    });
  }
});

router.post("/security/s3/sync", async (req, res) => {
  try {
    const findings = await syncS3SecurityFindings();

    res.json({
      success: true,
      count: findings.length,
      data: findings,
    });
  } catch (error) {
    console.error(
      "S3 security finding sync failed:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to sync S3 security findings",
    });
  }
});


router.get("/security/scan", async (_req, res) => {
  try {
    const findings = await scanAWSSecurity();

    res.json({
      success: true,
      count: findings.length,
      data: findings,
    });
  } catch (error) {
    console.error("AWS security scan failed:", error);

    res.status(500).json({
      success: false,
      message: "Failed to scan AWS security",
    });
  }
});


router.post("/security/sync", async (_req, res) => {
  try {
    const findings = await syncAWSSecurityFindings();

    res.json({
      success: true,
      message: "AWS security findings synced successfully",
      count: findings.length,
      data: findings,
    });
  } catch (error) {
    console.error("AWS security finding sync failed:", error);

    res.status(500).json({
      success: false,
      message: "Failed to sync AWS security findings",
    });
  }
});

router.post("/full-sync", async (_req, res) => {
  try {
    const resources = await syncAWSResources();
    const findings = await syncAWSSecurityFindings();

    const syncTime = new Date();

    await prisma.syncStatus.upsert({
      where: {
        id: "aws",
      },
      update: {
        lastSyncedAt: syncTime,
      },
      create: {
        id: "aws",
        lastSyncedAt: syncTime,
      },
    });

    res.json({
      success: true,
      message: "AWS resources and security findings synced successfully",
      data: {
        resources,
        findings,
        resourceCount: resources.length,
        findingCount: findings.length,
        lastSyncedAt: syncTime,
      },
    });
  } catch (error) {
    console.error("AWS full sync failed:", error);

    res.status(500).json({
      success: false,
      message: "Failed to complete AWS full sync",
    });
  }
});

router.get("/sync-status", async (_req, res) => {
  try {
    const syncStatus = await prisma.syncStatus.findUnique({
      where: {
        id: "aws",
      },
    });

    res.json({
      success: true,
      data: syncStatus,
    });
  } catch (error) {
    console.error("AWS sync status error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch AWS sync status",
    });
  }
});

export default router;