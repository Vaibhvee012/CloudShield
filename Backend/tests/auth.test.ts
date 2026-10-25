import jwt from "jsonwebtoken";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import app from "../src/app";
import prisma from "../src/lib/prisma";
import { TEST_PASSWORD, cleanupTestUsers, uniqueEmail } from "./helpers";

const register = (
  email: string,
  password: string = TEST_PASSWORD,
  name = "Vitest User"
) => request(app).post("/api/auth/register").send({ name, email, password });

const login = (email: string, password: string = TEST_PASSWORD) =>
  request(app).post("/api/auth/login").send({ email, password });

beforeAll(cleanupTestUsers);

afterAll(async () => {
  await cleanupTestUsers();
  await prisma.$disconnect();
});

describe("registration", () => {
  it("creates a viewer and never returns the password", async () => {
    const res = await register(uniqueEmail("reg"));

    expect(res.status).toBe(201);
    expect(res.body.data.role).toBe("VIEWER");
    expect(res.body.data).not.toHaveProperty("password");
    expect(JSON.stringify(res.body)).not.toContain(TEST_PASSWORD);
  });

  it("stores a bcrypt hash, not the password", async () => {
    const email = uniqueEmail("hash");
    await register(email);

    const user = await prisma.user.findUnique({ where: { email } });

    expect(user).not.toBeNull();
    expect(user!.password).not.toBe(TEST_PASSWORD);
    expect(user!.password.startsWith("$2")).toBe(true);
  });

  it("rejects a duplicate email regardless of letter case", async () => {
    const email = uniqueEmail("dup");

    await register(email);
    const res = await register(email.toUpperCase());

    expect(res.status).toBe(409);
  });

  it("rejects a password shorter than 8 characters", async () => {
    const res = await register(uniqueEmail("short"), "short");

    expect(res.status).toBe(400);
  });

  it("rejects missing fields", async () => {
    const res = await request(app).post("/api/auth/register").send({});

    expect(res.status).toBe(400);
  });

  it("writes an audit entry", async () => {
    const email = uniqueEmail("audit");
    await register(email);

    const user = await prisma.user.findUnique({ where: { email } });
    const count = await prisma.auditLog.count({
      where: {
        userId: user!.id,
        action: "AUTH_REGISTER",
        outcome: "SUCCESS",
      },
    });

    expect(count).toBe(1);
  });
});

describe("login", () => {
  it("returns a token and the user without the password", async () => {
    const email = uniqueEmail("login");
    await register(email);

    const res = await login(email);

    expect(res.status).toBe(200);
    expect(typeof res.body.data.token).toBe("string");
    expect(res.body.data.user.email).toBe(email);
    expect(res.body.data.user).not.toHaveProperty("password");
  });

  it("accepts the email in a different letter case", async () => {
    const email = uniqueEmail("case");
    await register(email);

    const res = await login(email.toUpperCase());

    expect(res.status).toBe(200);
  });

  it("gives the same answer for a wrong password and an unknown email", async () => {
    const email = uniqueEmail("same");
    await register(email);

    const wrongPassword = await login(email, "definitely-wrong-password");
    const unknownEmail = await login(uniqueEmail("nobody"));

    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    expect(wrongPassword.body.message).toBe(unknownEmail.body.message);
  });

  it("logs a failed login against the real account", async () => {
    const email = uniqueEmail("failed");
    await register(email);
    await login(email, "definitely-wrong-password");

    const user = await prisma.user.findUnique({ where: { email } });
    const count = await prisma.auditLog.count({
      where: {
        userId: user!.id,
        action: "AUTH_LOGIN",
        outcome: "FAILURE",
      },
    });

    expect(count).toBeGreaterThanOrEqual(1);
  });

  it("does not store an unknown email in the audit log", async () => {
    const email = uniqueEmail("stranger");
    await login(email);

    const rows = await prisma.auditLog.findMany({
      where: { action: "AUTH_LOGIN", userId: null },
    });

    expect(rows.length).toBeGreaterThanOrEqual(1);
    expect(JSON.stringify(rows)).not.toContain(email);
  });
});

describe("protected routes", () => {
  it("rejects a request without a token", async () => {
    const res = await request(app).get("/api/findings");

    expect(res.status).toBe(401);
  });

  it("rejects a garbage token", async () => {
    const res = await request(app)
      .get("/api/findings")
      .set("Authorization", "Bearer garbage");

    expect(res.status).toBe(401);
  });

  it("rejects a token signed with the wrong secret", async () => {
    const forged = jwt.sign({ userId: "x", role: "ADMIN" }, "wrong-secret");

    const res = await request(app)
      .get("/api/findings")
      .set("Authorization", `Bearer ${forged}`);

    expect(res.status).toBe(401);
  });

  it("rejects an expired token", async () => {
    const email = uniqueEmail("expired");
    await register(email);
    const user = await prisma.user.findUnique({ where: { email } });

    const expired = jwt.sign(
      { userId: user!.id, role: "VIEWER" },
      process.env.JWT_SECRET!,
      { expiresIn: -10 }
    );

    const res = await request(app)
      .get("/api/findings")
      .set("Authorization", `Bearer ${expired}`);

    expect(res.status).toBe(401);
  });

  it("lets a signed-in user see their own (empty) data", async () => {
    const email = uniqueEmail("data");
    await register(email);
    const { body } = await login(email);

    const res = await request(app)
      .get("/api/findings")
      .set("Authorization", `Bearer ${body.data.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it("blocks a viewer from an admin-only route", async () => {
    const email = uniqueEmail("viewer");
    await register(email);
    const { body } = await login(email);

    const res = await request(app)
      .get("/api/auth/admin-test")
      .set("Authorization", `Bearer ${body.data.token}`);

    expect(res.status).toBe(403);
  });

  // KNOWN GAP, fixed in 12.2: a deleted user's token keeps working.
  // it.fails passes while the gap exists. In 12.2 we change it to a normal it().
  it.fails("rejects a token whose user was deleted", async () => {
    const email = uniqueEmail("deleted");
    await register(email);
    const { body } = await login(email);

    await prisma.auditLog.deleteMany({
      where: { user: { email } },
    });
    await prisma.user.delete({ where: { email } });

    const res = await request(app)
      .get("/api/findings")
      .set("Authorization", `Bearer ${body.data.token}`);

    expect(res.status).toBe(401);
  });
});
