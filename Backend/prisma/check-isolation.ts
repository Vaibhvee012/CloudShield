import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const BASE = process.env.CHECK_API_URL || "http://localhost:5000/api";

// Safety: this script creates and deletes users. Local databases only.
const dbHost = new URL(process.env.DATABASE_URL!).hostname;
if (
  !["localhost", "127.0.0.1"].includes(dbHost) &&
  process.env.ALLOW_REMOTE_CHECK !== "1"
) {
  console.error(
    `REFUSING TO RUN: DATABASE_URL host is "${dbHost}", not local. Set ALLOW_REMOTE_CHECK=1 to override.`
  );
  process.exit(1);
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

const results: { check: string; result: string }[] = [];
const record = (check: string, pass: boolean, detail = "") =>
  results.push({ check, result: `${pass ? "PASS" : "FAIL"} ${detail}`.trim() });

const call = async (
  method: string,
  path: string,
  token?: string,
  body?: unknown
) => {
  const response = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let json: any = null;
  try {
    json = await response.json();
  } catch {
    // non-JSON response
  }
  return { status: response.status, json };
};

const createdEmails: string[] = [];

const createUser = async (label: string) => {
  const email = `isotest-${label}-${Date.now()}@example.com`.toLowerCase();
  const password = `TestPassw0rd!${Date.now()}`;
  createdEmails.push(email);

  const register = await call("POST", "/auth/register", undefined, {
    name: `Isolation ${label}`,
    email,
    password,
  });
  if (register.status >= 400) {
    throw new Error(`Register failed for ${label}: ${register.status}`);
  }

  const login = await call("POST", "/auth/login", undefined, {
    email,
    password,
  });
  const token: string | undefined = login.json?.token ?? login.json?.data?.token;
  if (!token) throw new Error(`No token for ${label}`);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error(`User row missing for ${label}`);

  return { email, token, userId: user.id };
};

type FindingSeed = {
  suffix: string;
  severity: string;
  withRemediation: boolean;
};

const seedAccount = async (
  tag: string,
  userId: string,
  accountId: string,
  resourceNames: string[],
  findings: FindingSeed[]
) => {
  const connection = await prisma.aWSConnection.create({
    data: {
      userId,
      accountId,
      roleArn: `arn:aws:iam::${accountId}:role/isotest-fake`,
      region: "us-east-1",
      status: "CONNECTED",
    },
  });

  const resourceIds: string[] = [];

  for (const name of resourceNames) {
    const id = `${tag}-res-${name}`;
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

  for (const f of findings) {
    const id = `${tag}-finding-${f.suffix}`;
    findingIds.push(id);
    await prisma.finding.create({
      data: {
        id,
        title: `Test finding ${f.suffix}`,
        severity: f.severity,
        resourceId: resourceIds[0],
        resourceType: "S3",
        region: "us-east-1",
        status: "OPEN",
        category: "Test",
        description: "Isolation test finding",
        awsConnectionId: connection.id,
      },
    });

    if (f.withRemediation) {
      await prisma.remediationAction.create({
        data: {
          id: `${tag}-remediation-${f.suffix}`,
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
};

const idsOf = (json: any): string[] =>
  Array.isArray(json?.data) ? json.data.map((row: any) => String(row.id)) : [];

const checkOwnData = async (
  label: string,
  tag: string,
  token: string,
  expected: { resources: number; findings: number; remediations: number; score: number }
) => {
  const endpoints: [string, number][] = [
    ["/resources", expected.resources],
    ["/findings", expected.findings],
    ["/remediation", expected.remediations],
    ["/aws/resources", expected.resources],
    ["/aws/findings", expected.findings],
    ["/aws/connections", 1],
  ];

  for (const [path, count] of endpoints) {
    const r = await call("GET", path, token);
    const ids = idsOf(r.json);
    const onlyOwn =
      path === "/aws/connections" || ids.every((id) => id.startsWith(tag));
    record(
      `${label}: GET ${path} returns only own rows`,
      r.status === 200 && ids.length === count && onlyOwn,
      `(status ${r.status}, rows ${ids.length}, expected ${count}, onlyOwn ${onlyOwn})`
    );
  }

  const security = await call("GET", "/security", token);
  record(
    `${label}: /security counts only own findings`,
    security.status === 200 &&
      security.json?.data?.totalFindings === expected.findings &&
      security.json?.data?.securityScore === expected.score,
    `(findings ${security.json?.data?.totalFindings}, score ${security.json?.data?.securityScore}, expected ${expected.findings}/${expected.score})`
  );
};

async function main() {
  console.log(`API: ${BASE}`);
  console.log(`Database host: ${dbHost}`);

  const health = await call("GET", "/health").catch(() => null);
  if (!health) {
    console.error("BACKEND NOT REACHABLE. Start it with: npm run dev");
    process.exitCode = 1;
    return;
  }

  try {
    // ---------- Part 1: brand-new user with no connection ----------
    const fresh = await createUser("new");

    for (const path of ["/findings", "/resources", "/remediation"]) {
      const r = await call("GET", path, fresh.token);
      const count = r.json?.count ?? r.json?.data?.length;
      record(
        `new user: GET ${path} is empty`,
        r.status === 200 && count === 0,
        `(status ${r.status}, count ${count})`
      );
    }

    for (const [method, path] of [
      ["GET", "/findings"],
      ["GET", "/resources"],
      ["GET", "/remediation"],
      ["GET", "/security"],
      ["POST", "/ai/risks/prioritize"],
    ] as const) {
      const r = await call(method, path);
      record(
        `no token: ${method} ${path} returns 401`,
        r.status === 401,
        `(status ${r.status})`
      );
    }

    const prioritizeEmpty = await call("POST", "/ai/risks/prioritize", fresh.token);
    record(
      "new user: prioritize returns 200 with no findings",
      prioritizeEmpty.status === 200,
      `(status ${prioritizeEmpty.status})`
    );

    const insight = await call("GET", "/ai/dashboard/insight", fresh.token);
    record(
      "new user: dashboard insight says NO_CONNECTION",
      insight.status === 200 && insight.json?.data?.state === "NO_CONNECTION",
      `(status ${insight.status}, state ${insight.json?.data?.state})`
    );

    // ---------- Part 2: two users who both have data ----------
    const stamp = Date.now();
    const tagA = `isotestA${stamp}`;
    const tagB = `isotestB${stamp}`;

    const userA = await createUser("A");
    const userB = await createUser("B");

    const seedA = await seedAccount(
      tagA,
      userA.userId,
      "111111111111",
      ["bucket-a1", "bucket-a2"],
      [
        { suffix: "1", severity: "HIGH", withRemediation: true },
        { suffix: "2", severity: "LOW", withRemediation: false },
      ]
    );

    const seedB = await seedAccount(
      tagB,
      userB.userId,
      "222222222222",
      ["bucket-b1"],
      [{ suffix: "1", severity: "CRITICAL", withRemediation: true }]
    );

    // Score = 100 - (HIGH 10 + LOW 2) = 88 for A; 100 - CRITICAL 20 = 80 for B.
    await checkOwnData("A", tagA, userA.token, {
      resources: 2,
      findings: 2,
      remediations: 1,
      score: 88,
    });

    await checkOwnData("B", tagB, userB.token, {
      resources: 1,
      findings: 1,
      remediations: 1,
      score: 80,
    });

    // Cross-user access must look like "not found".
    const bFinding = encodeURIComponent(seedB.findingIds[0]);
    const aFinding = encodeURIComponent(seedA.findingIds[0]);

    const crossChecks: [string, string, string, string][] = [
      ["A explain B's finding returns 404", "POST", `/ai/findings/${bFinding}/explain`, userA.token],
      ["A remediation on B's finding returns 404", "POST", `/ai/findings/${bFinding}/remediation`, userA.token],
      ["B explain A's finding returns 404", "POST", `/ai/findings/${aFinding}/explain`, userB.token],
      ["B remediation on A's finding returns 404", "POST", `/ai/findings/${aFinding}/remediation`, userB.token],
      ["B sync A's connection returns 404", "POST", `/aws/connections/${seedA.connectionId}/sync`, userB.token],
      ["B delete A's connection returns 404", "DELETE", `/aws/connections/${seedA.connectionId}`, userB.token],
      ["A sync B's connection returns 404", "POST", `/aws/connections/${seedB.connectionId}/sync`, userA.token],
    ];

    for (const [name, method, path, token] of crossChecks) {
      const r = await call(method, path, token);
      record(name, r.status === 404, `(status ${r.status})`);
    }

    // A's connection must have survived B's delete attempt.
    const stillThere = await prisma.aWSConnection.count({
      where: { id: seedA.connectionId },
    });
    record(
      "A's connection still exists after B's delete attempt",
      stillThere === 1,
      `(count ${stillThere})`
    );

        // Denied AI attempts must leave an audit trail for the requester.
    const deniedA = await prisma.auditLog.count({
      where: {
        userId: userA.userId,
        
        action: { in: ["AI_EXPLAIN_FINDING", "AI_SUGGEST_REMEDIATION"] },
        outcome: "DENIED",
      },
    });
    record(
      "audit log records A's denied AI attempts",
      deniedA >= 2,
      `(count ${deniedA}, expected 2)`
    );

    const deniedB = await prisma.auditLog.count({
      where: {
        userId: userB.userId,
        action: { in: ["AI_EXPLAIN_FINDING", "AI_SUGGEST_REMEDIATION"] },
        outcome: "DENIED",
      },
    });
    record(
      "audit log records B's denied AI attempts",
      deniedB >= 2,
      `(count ${deniedB}, expected 2)`
    );

    // ---------- Part 3: rate limit (fresh user has no findings, no Gemini cost) ----------
    let limited = 0;
    for (let i = 0; i < 12; i++) {
      const r = await call("POST", "/ai/risks/prioritize", fresh.token);
      if (r.status === 429) limited++;
    }
    record(
      "rate limit returns 429 after the limit",
      limited >= 1,
      `(${limited} of 12 calls limited)`
    );
    } finally {
    // Audit rows outlive their user (SetNull), so delete them explicitly first.
    const testUsers = await prisma.user.findMany({
      where: {
        OR: [
          { email: { in: createdEmails } },
          { email: { startsWith: "isotest-" } },
        ],
      },
      select: { id: true },
    });

    const testUserIds = testUsers.map((user) => user.id);

    await prisma.auditLog.deleteMany({
      where: { userId: { in: testUserIds } },
    });

    // Cascade removes connections, resources, findings and remediations.
    await prisma.user.deleteMany({
      where: { id: { in: testUserIds } },
    });
  }

  console.table(results);

  const failed = results.filter((r) => r.result.startsWith("FAIL")).length;
  console.log(
    failed === 0
      ? `\nALL ${results.length} CHECKS PASSED`
      : `\nSOME CHECKS FAILED (${failed} of ${results.length})`
  );
  process.exitCode = failed === 0 ? 0 : 1;
}

main()
  .catch((error) => {
    console.error("Check script error:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });