import {GetPublicAccessBlockCommand,S3Client,} from "@aws-sdk/client-s3";
import { getS3Buckets } from "./s3Service";
import {GetBucketEncryptionCommand,} from "@aws-sdk/client-s3";


const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
});

export const checkS3PublicAccess = async (bucketName: string) => {
  try {
    const command = new GetPublicAccessBlockCommand({
      Bucket: bucketName,
    });

    const response = await s3Client.send(command);

    const config = response.PublicAccessBlockConfiguration;

    const isProtected =
      config?.BlockPublicAcls === true &&
      config?.IgnorePublicAcls === true &&
      config?.BlockPublicPolicy === true &&
      config?.RestrictPublicBuckets === true;

    return {
      bucketName,
      check: "S3 Public Access",
      passed: isProtected,
      severity: isProtected ? "LOW" : "CRITICAL",
      message: isProtected
        ? "Public access is blocked."
        : "S3 bucket may allow public access.",
    };
  } catch (error: any) {
    // AWS returns this when Public Access Block
    // configuration has not been created for the bucket.
    if (
      error?.name === "NoSuchPublicAccessBlockConfiguration"
    ) {
      return {
        bucketName,
        check: "S3 Public Access",
        passed: false,
        severity: "CRITICAL",
        message: "Public Access Block is not configured.",
      };
    }

    console.error(
      `S3 public access check failed for ${bucketName}:`,
      error
    );

    throw error;
  }
};


export const scanS3Security = async () => {
  const buckets = await getS3Buckets();

  const results = [];

  for (const bucket of buckets) {
    if (!bucket.name) continue;

    const publicAccessResult =
      await checkS3PublicAccess(bucket.name);

    const encryptionResult =
      await checkS3Encryption(bucket.name);

    results.push(
      publicAccessResult,
      encryptionResult
    );
  }

  return results;
};

export const checkS3Encryption = async (bucketName: string) => {
  try {
    const command = new GetBucketEncryptionCommand({
      Bucket: bucketName,
    });

    const response = await s3Client.send(command);

    const rules =
      response.ServerSideEncryptionConfiguration?.Rules || [];

    const hasEncryption = rules.length > 0;

    return {
      bucketName,
      check: "S3 Encryption",
      passed: hasEncryption,
      severity: hasEncryption ? "LOW" : "HIGH",
      message: hasEncryption
        ? "Server-side encryption is enabled."
        : "Server-side encryption is not configured.",
    };
  } catch (error: any) {
    if (
      error?.name ===
        "ServerSideEncryptionConfigurationNotFoundError" ||
      error?.name === "NoSuchBucket"
    ) {
      return {
        bucketName,
        check: "S3 Encryption",
        passed: false,
        severity: "HIGH",
        message: "Server-side encryption is not configured.",
      };
    }

    console.error(
      `S3 encryption check failed for ${bucketName}:`,
      error
    );

    throw error;
  }
};