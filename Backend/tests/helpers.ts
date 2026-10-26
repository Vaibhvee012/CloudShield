import request from "supertest";
import app from "../src/app";
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
  // Cascades to connections, resources, findings and remediations.
  await prisma.user.deleteMany({ where: { id: { in: ids } } });
}

/* ---------- API helpers ---------- */

type Settable<T> = { set: (key: string, value: string) => T };

const authed = <T extends Settable<T>>(req: T, token?: string): T =>
  token ? req.set("Authorization", `Bearer ${token}`) : req;

export type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

// Sends a request to /api/<path> with an optional token.
export const send = (
  method: HttpMethod,
  path: string,
  token?: string,
  body?: object
) => {
  const req = request(app)[method](`/api${path}`);

  return authed(body ? req.send(body) : req, token);
};

export const api = (token?: string) => ({
  get: (path: string) => send("get", path, token),
  post: (path: string, body?: object) => send("post", path, token, body ?? {}),
  delete: (path: string) => send("delete", path, token),
});

/* ---------- fixtures ---------- */

// Registers and signs in a real user through the API.
export async function createTestUser(label: string) {
  const email = uniqueEmail(label);

  const registered = await request(app)
    .post("/api/auth/register")
    .send({ name: `Vitest ${label}`, email, password: TEST_PASSWORD });

  if (registered.status !== 201) {
    throw new Error(`Register failed for ${label}: ${registered.status}`);
  }

  const login = await request(app)
    .post("/api/auth/login")
    .send({ email, password: TEST_PASSWORD });

  const token: string | undefined = login.body?.data?.token;

  if (!token) {
    throw new Error(`No token for ${label}`);
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new Error(`User row missing for ${label}`);
  }

  return { email, token, userId: user.id };
}

export type FindingSeed = {
  suffix: string;
  severity: string;
  withRemediation: boolean;
};

// Creates a fake AWS connection with resources, findings and remediations.
export async function seedAccount(
  tag: string,
  userId: string,
  accountId: string,
  resourceNames: string[],
  findings: FindingSeed[]
) {
  const connection = await prisma.aWSConnection.create({
    data: {
      userId,
      accountId,
      roleArn: `arn:aws:iam::${accountId}:role/vitest-fake`,
      region: "us-east-1",
      status: "CONNECTED",
    },
  });

  const resourceIds: string[] = [];

  for (const [index, name] of resourceNames.entries()) {
    const id = `${tag}-res-${index}`;
    resourceIds.push(id);

    await prisma.resource.create({
      data: {
        id,
        name,
        type: "S3",
        region: "us-east-1",
        status: "active",
        environment: "test",
        riskLevel: "LOW",
        source: "AWS",
        awsConnectionId: connection.id,
      },
    });
  }

  const findingIds: string[] = [];

  for (const finding of findings) {
    const id = `${tag}-finding-${finding.suffix}`;
    findingIds.push(id);

    await prisma.finding.create({
      data: {
        id,
        title: `${tag} finding ${finding.suffix}`,
        severity: finding.severity,
        resourceId: resourceIds[0],
        resourceType: "S3",
        region: "us-east-1",
        status: "OPEN",
        category: "Test",
        description: "Vitest finding",
        awsConnectionId: connection.id,
      },
    });

    if (finding.withRemediation) {
      await prisma.remediationAction.create({
        data: {
          id: `${tag}-remediation-${finding.suffix}`,
          findingId: id,
          title: "Test remediation",
          action: "Test action",
          status: "PENDING",
          riskReduction: "LOW",
        },
      });
    }
  }

  return { connectionId: connection.id, resourceIds, findingIds };
}
