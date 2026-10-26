import { config } from "dotenv";

// Load .env.test (never .env). Its values win over anything already set.
config({ path: ".env.test", override: true, quiet: true });

process.env.NODE_ENV = "test";
process.env.JWT_SECRET ??= "test-jwt-secret-for-vitest-only-0123456789";
process.env.GEMINI_API_KEY ??= "test-gemini-key";
process.env.AWS_ACCESS_KEY_ID ??= "test-access-key";
process.env.AWS_SECRET_ACCESS_KEY ??= "test-secret-key";
process.env.AWS_REGION ??= "us-east-1";
process.env.FRONTEND_URL ??= "http://localhost:5173";

// prisma.ts loads the real .env, which can leak development values into the
// tests. Pin every setting the tests depend on.
process.env.AUTH_LOGIN_LIMIT = "10";
process.env.AUTH_REGISTER_LIMIT = "10";

// Safety: tests create and delete data. Local *_test databases only.
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is missing. Create Backend/.env.test (see .env.test.example)."
  );
}

const parsed = new URL(databaseUrl);
const dbName = decodeURIComponent(parsed.pathname.replace(/^\//, ""));

if (
  !["localhost", "127.0.0.1"].includes(parsed.hostname) ||
  !dbName.endsWith("_test")
) {
  throw new Error(
    `REFUSING TO RUN TESTS: DATABASE_URL must be a local database whose name ends in _test (got host "${parsed.hostname}", database "${dbName}").`
  );
}
