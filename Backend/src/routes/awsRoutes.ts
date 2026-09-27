import { Router } from "express";
import { getAWSAccountIdentity } from "../services/awsService";
import { getEC2Instances } from "../services/ec2Service";
import { getS3Buckets } from "../services/s3Service";
import { getRDSInstances } from "../services/rdsService";
import { discoverAWSResources } from "../services/awsResourceService";
import { syncAWSResources } from "../services/awsResourcePersistence";

const router = Router();

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


export default router;