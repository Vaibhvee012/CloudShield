import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const finding = await prisma.finding.findFirst({ select: { id: true } });
  console.log(finding ? finding.id : "No findings in database");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());