import {
  EC2Client,
  DescribeInstancesCommand,
} from "@aws-sdk/client-ec2";

const ec2Client = new EC2Client({
  region: process.env.AWS_REGION || "ap-south-1",
});

export const getEC2Instances = async () => {
  const command = new DescribeInstancesCommand({});

  const response = await ec2Client.send(command);

  const instances =
    response.Reservations?.flatMap(
      (reservation) => reservation.Instances || []
    ) || [];

  return instances.map((instance) => ({
    id: instance.InstanceId,
    name:
      instance.Tags?.find((tag) => tag.Key === "Name")?.Value ||
      "Unnamed Instance",
    state: instance.State?.Name,
    instanceType: instance.InstanceType,
    region: process.env.AWS_REGION || "ap-south-1",
    privateIp: instance.PrivateIpAddress,
    publicIp: instance.PublicIpAddress,
  }));
};