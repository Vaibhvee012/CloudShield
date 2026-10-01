import {
  EC2Client,
  DescribeInstancesCommand,
  DescribeSecurityGroupsCommand,
} from "@aws-sdk/client-ec2";

const ec2Client = new EC2Client({
  region: process.env.AWS_REGION || "ap-south-1",
});

const AWS_REGION = process.env.AWS_REGION || "ap-south-1";

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
    region: AWS_REGION,
    privateIp: instance.PrivateIpAddress,
    publicIp: instance.PublicIpAddress,
    securityGroupIds:
      instance.SecurityGroups?.map(
        (securityGroup) => securityGroup.GroupId
      ).filter((id): id is string => Boolean(id)) || [],
  }));
};

/*
 * Scan EC2 security groups for unrestricted inbound access.
 */
export const scanEC2SecurityGroups = async () => {
  const instances = await getEC2Instances();

  const securityGroupIds = [
    ...new Set(
      instances
        .flatMap((instance) => instance.securityGroupIds || [])
        .filter((id): id is string => Boolean(id))
    ),
  ];

  if (securityGroupIds.length === 0) {
    return [];
  }

  const command = new DescribeSecurityGroupsCommand({
    GroupIds: securityGroupIds,
  });

  const response = await ec2Client.send(command);

  const findings = [];

  for (const securityGroup of response.SecurityGroups || []) {
    const groupId = securityGroup.GroupId;

    if (!groupId) {
      continue;
    }

    // Find an EC2 instance using this security group.
    const instance = instances.find((ec2Instance) =>
      ec2Instance.securityGroupIds.includes(groupId)
    );

    // We need an actual EC2 resource for the Finding relation.
    if (!instance?.id) {
      continue;
    }

    for (const permission of securityGroup.IpPermissions || []) {
      const isOpenToInternet = permission.IpRanges?.some(
        (range) => range.CidrIp === "0.0.0.0/0"
      );

      if (!isOpenToInternet) {
        continue;
      }

      const fromPort = permission.FromPort;
      const toPort = permission.ToPort;

      /*
       * All ports exposed to the internet.
       */
      if (
        fromPort === undefined ||
        toPort === undefined
      ) {
        findings.push({
          id: `ec2-sg-open-all-${groupId}`,
          title: "EC2 Security Group Allows Unrestricted Access",
          severity: "HIGH",
          resourceId: instance.id,
          resourceType: "EC2",
          region: instance.region,
          status: "OPEN",
          category: "Network Exposure",
          description: `Security group ${
            securityGroup.GroupName || groupId
          } allows unrestricted inbound access from the internet.`,
        });

        continue;
      }

      /*
       * SSH exposed to the internet.
       */
      if (fromPort <= 22 && toPort >= 22) {
        findings.push({
          id: `ec2-sg-ssh-${groupId}`,
          title: "EC2 Security Group Allows Public SSH Access",
          severity: "HIGH",
          resourceId: instance.id,
          resourceType: "EC2",
          region: instance.region,
          status: "OPEN",
          category: "Network Exposure",
          description: `Security group ${
            securityGroup.GroupName || groupId
          } allows inbound SSH access on port 22 from the internet.`,
        });
      }

      /*
       * RDP exposed to the internet.
       */
      if (fromPort <= 3389 && toPort >= 3389) {
        findings.push({
          id: `ec2-sg-rdp-${groupId}`,
          title: "EC2 Security Group Allows Public RDP Access",
          severity: "HIGH",
          resourceId: instance.id,
          resourceType: "EC2",
          region: instance.region,
          status: "OPEN",
          category: "Network Exposure",
          description: `Security group ${
            securityGroup.GroupName || groupId
          } allows inbound RDP access on port 3389 from the internet.`,
        });
      }
    }
  }

  return findings;
};