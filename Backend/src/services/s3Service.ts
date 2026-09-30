import {
  S3Client,
  ListBucketsCommand,
  GetPublicAccessBlockCommand,
} from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
});

export const getS3Buckets = async () => {
  const command = new ListBucketsCommand({});

  const response = await s3Client.send(command);

  const buckets = response.Buckets || [];

  const bucketDetails = await Promise.all(
    buckets.map(async (bucket) => {
      let publicAccessBlocked = true;

      try {
        const publicAccessCommand = new GetPublicAccessBlockCommand({
          Bucket: bucket.Name,
        });

        const publicAccess = await s3Client.send(publicAccessCommand);

        publicAccessBlocked =
          publicAccess.PublicAccessBlockConfiguration?.BlockPublicAcls === true &&
          publicAccess.PublicAccessBlockConfiguration?.IgnorePublicAcls === true &&
          publicAccess.PublicAccessBlockConfiguration?.BlockPublicPolicy === true &&
          publicAccess.PublicAccessBlockConfiguration?.RestrictPublicBuckets === true;
      } catch {
        publicAccessBlocked = false;
      }

      return {
        name: bucket.Name,
        createdAt: bucket.CreationDate,
        type: "S3 Bucket",
        region: process.env.AWS_REGION || "ap-south-1",
        publicAccessBlocked,
      };
    })
  );

  return bucketDetails;
};