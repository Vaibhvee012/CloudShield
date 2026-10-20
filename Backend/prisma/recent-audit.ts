import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const rows = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      createdAt: true,
      action: true,
      outcome: true,
      targetId: true,
      metadata: true,
      user: { select: { email: true } },
    },
  });

  console.log(JSON.stringify(rows, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());