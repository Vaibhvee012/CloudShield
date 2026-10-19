import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const BASE = process.env.CHECK_API_URL || "http://localhost:5000/api";

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

async function main() {
  console.log(`API: ${BASE}`);

  const health = await call("GET", "/health").catch(() => null);
  if (!health) {
    console.error("BACKEND NOT REACHABLE. Start it with: npm run dev");
    process.exitCode = 1;
    return;
  }

  const stamp = Date.now();
  const email = `isolation-${stamp}@example.com`;
  const password = `TestPassw0rd!${stamp}`;

  try {
    const register = await call("POST", "/auth/register", undefined, {
      name: "Isolation Test",
      email,
      password,
    });
    if (register.status >= 400) {
      console.error("Register failed:", register.status, register.json);
      process.exitCode = 1;
      return;
    }

    const login = await call("POST", "/auth/login", undefined, {
      email,
      password,
    });
    const token: string | undefined = login.json?.token ?? login.json?.data?.token;

    if (!token) {
      console.error("No token in login response:", login.json);
      process.exitCode = 1;
      return;
    }

    // 1. Data endpoints must be empty for a new user.
    for (const path of ["/findings", "/resources", "/remediation"]) {
      const r = await call("GET", path, token);
      const count = r.json?.count ?? r.json?.data?.length;
      record(`GET ${path} is empty for new user`, r.status === 200 && count === 0, `(status ${r.status}, count ${count})`);
    }

    // 2. No token must be rejected.
    const noAuth = await call("POST", "/ai/risks/prioritize");
    record("AI endpoint without token returns 401", noAuth.status === 401, `(status ${noAuth.status})`);

    // 3. Prioritize for a new user: instant 200, no Gemini call.
    const prioritize = await call("POST", "/ai/risks/prioritize", token);
    record("prioritize returns 200 with no findings", prioritize.status === 200, `(status ${prioritize.status})`);

        // 3b. Dashboard insight for a user with no connection: instant, no Gemini.
    const insight = await call("GET", "/ai/dashboard/insight", token);
    record(
      "dashboard insight says NO_CONNECTION for new user",
      insight.status === 200 && insight.json?.data?.state === "NO_CONNECTION",
      `(status ${insight.status}, state ${insight.json?.data?.state})`
    );

    // 4. Someone else's finding must be a 404.
    const someoneElses = await prisma.finding.findFirst({ select: { id: true } });
    if (!someoneElses) {
      record("explain/remediation on another user's finding", false, "(no findings in DB to test with)");
    } else {
      const id = encodeURIComponent(someoneElses.id);
      for (const action of ["explain", "remediation"]) {
        const r = await call("POST", `/ai/findings/${id}/${action}`, token);
        record(`${action} on another user's finding returns 404`, r.status === 404, `(status ${r.status})`);
      }
    }

    // 5. Rate limit: 12 cheap calls, expect 429 at the end.
    let limited = 0;
    for (let i = 0; i < 12; i++) {
      const r = await call("POST", "/ai/risks/prioritize", token);
      if (r.status === 429) limited++;
    }
    record("rate limit returns 429 after the limit", limited >= 1, `(${limited} of 12 calls limited)`);
  } finally {
    await prisma.user.deleteMany({ where: { email } });
  }

  console.table(results);
  const failed = results.some((r) => r.result.startsWith("FAIL"));
  console.log(failed ? "\nSOME CHECKS FAILED" : "\nALL CHECKS PASSED");
  process.exitCode = failed ? 1 : 0;
}

main()
  .catch((error) => {
    console.error("Check script error:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });