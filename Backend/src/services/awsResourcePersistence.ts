import prisma from "../lib/prisma";
import { discoverAWSResources } from "./awsResourceService";
import { discoverUserAWSResources } from "./userAWSResourceDiscoveryService";

export const syncAWSResources = async () => {
  const resources = await discoverAWSResources();

  const discoveredIds = resources.map((resource) => resource.id);

  for (const resource of resources) {
    await prisma.resource.upsert({
      where: {
        id: resource.id,
      },
      update: {
        name: resource.name,
        type: resource.type,
        region: resource.region,
        status: resource.status,
        environment: resource.environment,
        riskLevel: resource.riskLevel,
        source: "AWS",
      },
      create: {
        id: resource.id,
        name: resource.name,
        type: resource.type,
        region: resource.region,
        status: resource.status,
        environment: resource.environment,
        riskLevel: resource.riskLevel,
        source: "AWS",
      },
    });
  }

  if (discoveredIds.length > 0) {
    await prisma.resource.updateMany({
      where: {
        source: "AWS",
        awsConnectionId: null,
        id: {
          notIn: discoveredIds,
        },
      },
      data: {
        status: "disconnected",
      },
    });
  }

  return resources;
};

export const syncUserAWSResources = async (
  connectionId: string
) => {
  const connection = await prisma.aWSConnection.findUnique({
    where: {
      id: connectionId,
    },
  });

  if (!connection) {
    throw new Error("AWS connection not found");
  }

  const resources = await discoverUserAWSResources(
    connectionId
  );

  const discoveredIds = resources.map(
    (resource) =>
      `${connectionId}:${resource.resourceType}:${resource.resourceId}`
  );

  for (const resource of resources) {
    const resourceId = `${connectionId}:${resource.resourceType}:${resource.resourceId}`;

    await prisma.resource.upsert({
      where: {
        id: resourceId,
      },
      update: {
        name: resource.name,
        type: resource.resourceType,
        region: resource.region,
        status: "active",
        source: "AWS",
        awsConnectionId: connectionId,
      },
      create: {
        id: resourceId,
        name: resource.name,
        type: resource.resourceType,
        region: resource.region,
        status: "active",
        environment: "AWS",
        riskLevel: "LOW",
        source: "AWS",
        awsConnectionId: connectionId,
      },
    });
  }

  await prisma.resource.updateMany({
    where: {
      awsConnectionId: connectionId,
      source: "AWS",
      id: {
        notIn: discoveredIds,
      },
    },
    data: {
      status: "disconnected",
    },
  });

  await prisma.aWSConnection.update({
    where: {
      id: connectionId,
    },
    data: {
      lastSyncAt: new Date(),
      status: "CONNECTED",
    },
  });

  return resources;
};