import { config } from "dotenv";
import { execSync } from "node:child_process";
import { Client } from "pg";

config({ path: ".env.test", quiet: true });

const rawUrl = process.env.DATABASE_URL;

if (!rawUrl) {
  console.error(
    "DATABASE_URL is missing. Create Backend/.env.test first (see .env.test.example)."
  );
  process.exit(1);
}

const databaseUrl: string = rawUrl;
const parsed = new URL(databaseUrl);
const dbName = decodeURIComponent(parsed.pathname.replace(/^\//, ""));

if (
  !["localhost", "127.0.0.1"].includes(parsed.hostname) ||
  !/^[a-z0-9_]+_test$/.test(dbName)
) {
  console.error(
    `Refusing to continue: the test database must be local and its name must end in _test (got host "${parsed.hostname}", database "${dbName}").`
  );
  process.exit(1);
}

async function main() {
  // Connect to the maintenance database to create the test database if needed.
  const adminUrl = new URL(databaseUrl);
  adminUrl.pathname = "/postgres";

  const client = new Client({ connectionString: adminUrl.toString() });
  await client.connect();

  try {
    const exists = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );

    if (exists.rowCount === 0) {
      // dbName was validated above: lowercase letters, digits and underscores only.
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Created database ${dbName}`);
    } else {
      console.log(`Database ${dbName} already exists`);
    }
  } finally {
    await client.end();
  }

  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });

  console.log("Test database is ready.");
}

main().catch((error) => {
  console.error("Test database setup failed:", error.message);
  process.exit(1);
});
