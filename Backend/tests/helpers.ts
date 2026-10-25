import prisma from "../src/lib/prisma";

export const TEST_PASSWORD = "TestPassw0rd!";

export const uniqueEmail = (label: string) =>
  `vitest-${label}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}@example.com`;

// Safe because setup.ts guarantees this is a local *_test database.
export async function cleanupTestUsers() {
  const users = await prisma.user.findMany({
    where: { email: { startsWith: "vitest-" } },
    select: { id: true },
  });

  const ids = users.map((user) => user.id);

  await prisma.auditLog.deleteMany({ where: { userId: { in: ids } } });
  // Attempts that could not be tied to a user (for example unknown emails).
  await prisma.auditLog.deleteMany({ where: { userId: null } });
  await prisma.user.deleteMany({ where: { id: { in: ids } } });
}
