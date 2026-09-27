import {
  S3Client,
  ListBucketsCommand,
} from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
});

export const getS3Buckets = async () => {
  const command = new ListBucketsCommand({});

  const response = await s3Client.send(command);

  return (
    response.Buckets?.map((bucket) => ({
      name: bucket.Name,
      createdAt: bucket.CreationDate,
      type: "S3 Bucket",
      region: process.env.AWS_REGION || "ap-south-1",
    })) || []
  );
};