
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const apply = process.argv.includes("--apply");

const describeTarget = () => {
  try {
    const url = new URL(process.env.DATABASE_URL!);
    return `${url.hostname}:${url.port || "5432"}${url.pathname}`;
  } catch {
    return "unknown";
  }
};

async function main() {
  console.log(`Database: ${describeTarget()}`);
  console.log(
    apply
      ? "MODE: APPLY (rows WILL be deleted)"
      : "MODE: DRY RUN (nothing will be deleted)"
  );

  const unowned = {
    resources: await prisma.resource.count({
      where: { awsConnectionId: null },
    }),
    findings: await prisma.finding.count({
      where: { awsConnectionId: null },
    }),
    remediations: await prisma.remediationAction.count({
      where: { finding: { awsConnectionId: null } },
    }),
  };

  const owned = {
    resources: await prisma.resource.count({
      where: { awsConnectionId: { not: null } },
    }),
    findings: await prisma.finding.count({
      where: { awsConnectionId: { not: null } },
    }),
  };

  // Safety check: owned findings attached to unowned resources would be
  // removed by the cascade, so stop if any exist.
  const crossLinked = await prisma.finding.count({
    where: {
      awsConnectionId: { not: null },
      resource: { awsConnectionId: null },
    },
  });

  console.log("\nUnowned rows (awsConnectionId = null):");
  console.table(unowned);

  console.log("Owned rows (will be kept):");
  console.table(owned);

  if (crossLinked > 0) {
    console.error(
      `\nABORTED: ${crossLinked} owned finding(s) are linked to unowned resources. Investigate before deleting.`
    );
    process.exitCode = 1;
    return;
  }

  if (!apply) {
    console.log("\nDry run complete. Re-run with --apply to delete.");
    return;
  }

  await prisma.$transaction([
    prisma.remediationAction.deleteMany({
      where: { finding: { awsConnectionId: null } },
    }),
    prisma.finding.deleteMany({
      where: { awsConnectionId: null },
    }),
    prisma.resource.deleteMany({
      where: { awsConnectionId: null },
    }),
  ]);

  console.log("\nDeleted all unowned remediations, findings and resources.");
}

main()
  .catch((error) => {
    console.error("Cleanup failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });