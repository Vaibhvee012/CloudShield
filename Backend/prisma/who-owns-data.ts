import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const connections = await prisma.aWSConnection.findMany({
    select: {
      accountId: true,
      region: true,
      status: true,
      user: { select: { name: true, email: true } },
      _count: { select: { resources: true, findings: true } },
    },
  });

  console.log(
    connections.map((c) => ({
      owner: `${c.user.name} <${c.user.email}>`,
      accountId: c.accountId,
      status: c.status,
      resources: c._count.resources,
      findings: c._count.findings,
    }))
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());