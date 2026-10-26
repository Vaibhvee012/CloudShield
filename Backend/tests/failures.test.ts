import request from "supertest";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

// Gemini and AWS are replaced by mocks that each test can make fail.
const { generateAIResponse, assumeAWSRole, syncUserAWSSecurityFindings } =
  vi.hoisted(() => ({
    generateAIResponse: vi.fn(),
    assumeAWSRole: vi.fn(),
    syncUserAWSSecurityFindings: vi.fn(),
  }));

vi.mock("../src/services/geminiService", () => ({ generateAIResponse }));

vi.mock("../src/services/awsConnectionService", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("../src/services/awsConnectionService")
  >()),
  assumeAWSRole,
}));

vi.mock("../src/services/awsFindingPersistence", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("../src/services/awsFindingPersistence")
  >()),
  syncUserAWSSecurityFindings,
}));

import app from "../src/app";
import { AIServiceError } from "../src/lib/aiErrors";
import prisma from "../src/lib/prisma";
import {
  api,
  cleanupTestUsers,
  createTestUser,
  seedAccount,
} from "./helpers";

type TestUser = Awaited<ReturnType<typeof createTestUser>>;
type Seed = Awaited<ReturnType<typeof seedAccount>>;

const tag = `fail${Date.now()}`;

let owner: TestUser; // has data and a connection
let newcomer: TestUser; // has nothing
let seed: Seed;

const latestAudit = (userId: string, action: string) =>
  prisma.auditLog.findFirst({
    where: { userId, action },
    orderBy: { createdAt: "desc" },
  });

const validConnection = {
  accountId: "444444444444",
  roleArn: "arn:aws:iam::444444444444:role/VitestRole",
  region: "us-east-1",
};

beforeAll(async () => {
  await cleanupTestUsers();

  owner = await createTestUser("owner");
  newcomer = await createTestUser("newcomer");

  seed = await seedAccount(
    tag,
    owner.userId,
    "555555555555",
    ["bucket-one"],
    [{ suffix: "1", severity: "HIGH", withRemediation: true }]
  );
});

beforeEach(() => {
  generateAIResponse.mockReset().mockResolvedValue("Mocked AI answer.");
  assumeAWSRole.mockReset();
  syncUserAWSSecurityFindings.mockReset().mockResolvedValue([]);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterAll(async () => {
  await cleanupTestUsers();
  await prisma.$disconnect();
});

describe("when Gemini fails", () => {
  const cases: [number, string][] = [
    [429, "CloudShield AI is busy right now."],
    [503, "CloudShield AI is temporarily unavailable."],
    [504, "CloudShield AI took too long to respond."],
    [502, "CloudShield AI returned an empty response."],
  ];

  it.each(cases)(
    "chat passes a %s through with a friendly message and audits it",
    async (status, message) => {
      generateAIResponse.mockRejectedValueOnce(
        new AIServiceError(status, message)
      );

      const res = await api(owner.token).post("/ai/chat", {
        question: "What are my risks?",
      });

      expect(res.status).toBe(status);
      expect(res.body).toEqual({ success: false, message });

      const row = await latestAudit(owner.userId, "AI_CHAT");

      expect(row?.outcome).toBe("FAILURE");
      expect(JSON.stringify(row?.metadata)).toContain(String(status));
    }
  );

  it("an unexpected error becomes a plain 500 with nothing leaked", async () => {
    generateAIResponse.mockRejectedValueOnce(
      new Error("boom postgres://user:password@internal-host/db")
    );

    const res = await api(owner.token).post("/ai/chat", {
      question: "What are my risks?",
    });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Failed to generate AI response");
    expect(JSON.stringify(res.body)).not.toContain("postgres://");
    expect(JSON.stringify(res.body)).not.toContain("boom");
  });

  it("explain fails cleanly and is audited against the finding", async () => {
    generateAIResponse.mockRejectedValueOnce(new AIServiceError(503, "Down."));

    const res = await api(owner.token).post(
      `/ai/findings/${encodeURIComponent(seed.findingIds[0])}/explain`
    );

    expect(res.status).toBe(503);
    expect(res.body.success).toBe(false);

    const row = await latestAudit(owner.userId, "AI_EXPLAIN_FINDING");

    expect(row?.outcome).toBe("FAILURE");
    expect(row?.targetId).toBe(seed.findingIds[0]);
  });

  it("remediation advice fails cleanly and is audited", async () => {
    generateAIResponse.mockRejectedValueOnce(new AIServiceError(429, "Busy."));

    const res = await api(owner.token).post(
      `/ai/findings/${encodeURIComponent(seed.findingIds[0])}/remediation`
    );

    expect(res.status).toBe(429);

    const row = await latestAudit(owner.userId, "AI_SUGGEST_REMEDIATION");

    expect(row?.outcome).toBe("FAILURE");
  });

  it("prioritize fails cleanly and is audited", async () => {
    generateAIResponse.mockRejectedValueOnce(new AIServiceError(504, "Slow."));

    const res = await api(owner.token).post("/ai/risks/prioritize");

    expect(res.status).toBe(504);

    const row = await latestAudit(owner.userId, "AI_PRIORITIZE_RISKS");

    expect(row?.outcome).toBe("FAILURE");
  });

  it("a failed dashboard insight is not cached, so the next call tries again", async () => {
    generateAIResponse.mockRejectedValueOnce(new AIServiceError(503, "Down."));

    const failed = await api(owner.token).get("/ai/dashboard/insight");

    expect(failed.status).toBe(503);

    const row = await latestAudit(owner.userId, "AI_DASHBOARD_INSIGHT");

    expect(row?.outcome).toBe("FAILURE");

    const retried = await api(owner.token).get("/ai/dashboard/insight");

    expect(retried.status).toBe(200);
    expect(retried.body.data.state).toBe("READY");
    expect(generateAIResponse).toHaveBeenCalledTimes(2);
  });
});

describe("connecting an AWS account", () => {
  const countConnections = (userId: string) =>
    prisma.aWSConnection.count({ where: { userId } });

  it("requires a token", async () => {
    const res = await api().post("/aws/connect", validConnection);

    expect(res.status).toBe(401);
  });

  it.each([
    ["an account ID with 11 digits", { accountId: "44444444444" }],
    ["an account ID with letters", { accountId: "44444444444a" }],
    ["a role ARN that is not a role", { roleArn: "arn:aws:s3:::my-bucket" }],
    ["a missing region", { region: "" }],
  ])("rejects %s and does not call AWS", async (_name, change) => {
    const res = await api(newcomer.token).post("/aws/connect", {
      ...validConnection,
      ...change,
    });

    expect(res.status).toBe(400);
    expect(assumeAWSRole).not.toHaveBeenCalled();
    expect(await countConnections(newcomer.userId)).toBe(0);
  });

  it("returns a generic error when AWS refuses the role, and saves nothing", async () => {
    assumeAWSRole.mockRejectedValue(
      new Error("AccessDenied: not authorized to assume VitestRole")
    );

    const res = await api(newcomer.token).post("/aws/connect", validConnection);

    expect(res.status).toBe(500);
    expect(JSON.stringify(res.body)).not.toContain("AccessDenied");
    expect(JSON.stringify(res.body)).not.toContain("VitestRole");
    expect(await countConnections(newcomer.userId)).toBe(0);

    const row = await latestAudit(newcomer.userId, "AWS_CONNECT");

    expect(row?.outcome).toBe("FAILURE");
  });

  it("refuses a role that belongs to a different account, and saves nothing", async () => {
    assumeAWSRole.mockResolvedValue({ accountId: "999999999999" });

    const res = await api(newcomer.token).post("/aws/connect", validConnection);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/does not match/i);
    expect(await countConnections(newcomer.userId)).toBe(0);

    const row = await latestAudit(newcomer.userId, "AWS_CONNECT");

    expect(JSON.stringify(row?.metadata)).toContain("account_id_mismatch");
  });

  it("returns a 502 when AWS does not say which account it is", async () => {
    assumeAWSRole.mockResolvedValue({});

    const res = await api(newcomer.token).post("/aws/connect", validConnection);

    expect(res.status).toBe(502);
    expect(await countConnections(newcomer.userId)).toBe(0);
  });

  it("connects, hides the role ARN everywhere, and does not duplicate on retry", async () => {
    assumeAWSRole.mockResolvedValue({ accountId: "444444444444" });

    const first = await api(newcomer.token).post("/aws/connect", validConnection);
    const second = await api(newcomer.token).post("/aws/connect", validConnection);

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(await countConnections(newcomer.userId)).toBe(1);

    // The role ARN is never sent back to the browser...
    expect(JSON.stringify(first.body)).not.toContain("VitestRole");

    const list = await api(newcomer.token).get("/aws/connections");

    expect(JSON.stringify(list.body)).not.toContain("VitestRole");

    // ...and never written to the audit log. Only the last 4 digits are.
    const row = await latestAudit(newcomer.userId, "AWS_CONNECT");

    expect(row?.outcome).toBe("SUCCESS");
    expect(JSON.stringify(row)).not.toContain("VitestRole");
    expect(JSON.stringify(row?.metadata)).toContain("4444");
  });
});

describe("syncing an AWS account", () => {
  it("returns the counts and audits a successful sync", async () => {
    const res = await api(owner.token).post(
      `/aws/connections/${seed.connectionId}/sync`
    );

    expect(res.status).toBe(200);
    expect(res.body.counts).toEqual({ resources: 1, findings: 0 });
    expect(syncUserAWSSecurityFindings).toHaveBeenCalledWith(
      seed.connectionId
    );

    const row = await latestAudit(owner.userId, "AWS_SYNC");

    expect(row?.outcome).toBe("SUCCESS");
  });

  it("returns a generic error when the sync fails, and audits it", async () => {
    syncUserAWSSecurityFindings.mockRejectedValue(
      new Error("ThrottlingException for arn:aws:iam::555555555555:role/Secret")
    );

    const res = await api(owner.token).post(
      `/aws/connections/${seed.connectionId}/sync`
    );

    expect(res.status).toBe(500);
    expect(res.body.message).toBe(
      "Failed to sync AWS resources and security findings"
    );
    expect(JSON.stringify(res.body)).not.toContain("ThrottlingException");
    expect(JSON.stringify(res.body)).not.toContain("role/Secret");

    const row = await latestAudit(owner.userId, "AWS_SYNC");

    expect(row?.outcome).toBe("FAILURE");
  });

  it("a user with no connections can run a full sync and nothing is scanned", async () => {
    const clean = await createTestUser("clean");

    const res = await api(clean.token).post("/aws/full-sync");

    expect(res.status).toBe(200);
    expect(res.body.data.connectionsSynced).toBe(0);
    expect(syncUserAWSSecurityFindings).not.toHaveBeenCalled();
  });

  it("a full sync reports totals across the user's connections", async () => {
    const res = await api(owner.token).post("/aws/full-sync");

    expect(res.status).toBe(200);
    expect(res.body.data.connectionsSynced).toBe(1);
    expect(res.body.data.resourcesSynced).toBe(1);
  });

  it("a failing full sync returns a generic error and is audited", async () => {
    syncUserAWSSecurityFindings.mockRejectedValue(new Error("AWS exploded"));

    const res = await api(owner.token).post("/aws/full-sync");

    expect(res.status).toBe(500);
    expect(JSON.stringify(res.body)).not.toContain("exploded");

    const row = await latestAudit(owner.userId, "AWS_SYNC");

    expect(row?.outcome).toBe("FAILURE");
  });
});

describe("malformed and oversized requests", () => {
  it("answers broken JSON with a 400 and no internals", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send("{ this is not json");

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    // Only a success flag and a message: no stack, no parser details.
    expect(Object.keys(res.body).sort()).toEqual(["message", "success"]);
    expect(JSON.stringify(res.body)).not.toMatch(
      /SyntaxError|node_modules|Unexpected token|\.js:/
    );
  });

  it("rejects a body over the size limit with a 413", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "a@example.com", password: "x".repeat(1_300_000) });

    expect(res.status).toBe(413);
  });
});