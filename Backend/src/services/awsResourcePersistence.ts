import prisma from "../lib/prisma";
import { discoverAWSResources } from "./awsResourceService";

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