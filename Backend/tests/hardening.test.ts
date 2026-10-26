import jwt from "jsonwebtoken";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import app from "../src/app";
import prisma from "../src/lib/prisma";
import { TEST_PASSWORD, cleanupTestUsers, uniqueEmail } from "./helpers";

const register = (email: string) =>
  request(app)
    .post("/api/auth/register")
    .send({ name: "Vitest User", email, password: TEST_PASSWORD });

const login = (email: string, password: string = TEST_PASSWORD) =>
  request(app).post("/api/auth/login").send({ email, password });

beforeAll(cleanupTestUsers);

afterAll(async () => {
  delete process.env.TEST_RATE_LIMITS;
  await cleanupTestUsers();
  await prisma.$disconnect();
});

describe("authentication reads the database on every request", () => {
  it("applies a role change without waiting for the token to expire", async () => {
    const email = uniqueEmail("role");
    await register(email);
    const { body } = await login(email);
    const token = body.data.token;

    const before = await request(app)
      .get("/api/auth/admin-test")
      .set("Authorization", `Bearer ${token}`);

    expect(before.status).toBe(403);

    await prisma.user.update({ where: { email }, data: { role: "ADMIN" } });

    const promoted = await request(app)
      .get("/api/auth/admin-test")
      .set("Authorization", `Bearer ${token}`);

    expect(promoted.status).toBe(200);

    await prisma.user.update({ where: { email }, data: { role: "VIEWER" } });

    const demoted = await request(app)
      .get("/api/auth/admin-test")
      .set("Authorization", `Bearer ${token}`);

    expect(demoted.status).toBe(403);
  });

  it("ignores the role written inside the token", async () => {
    const email = uniqueEmail("claim");
    await register(email);
    const user = await prisma.user.findUnique({ where: { email } });

    // A validly signed token that claims ADMIN for a VIEWER account.
    const token = jwt.sign(
      { userId: user!.id, role: "ADMIN" },
      process.env.JWT_SECRET!
    );

    const res = await request(app)
      .get("/api/auth/admin-test")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  it("rejects a signed token with a malformed payload", async () => {
    const token = jwt.sign(
      { userId: 12345, role: "ADMIN" },
      process.env.JWT_SECRET!
    );

    const res = await request(app)
      .get("/api/findings")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(401);
  });
});

describe("login rate limit", () => {
  beforeAll(() => {
    process.env.TEST_RATE_LIMITS = "on";
  });

  afterAll(() => {
    delete process.env.TEST_RATE_LIMITS;
  });

  it("blocks sign-in after 10 failed attempts and logs it", async () => {
    const email = uniqueEmail("limit");
    await register(email);

    for (let attempt = 0; attempt < 10; attempt++) {
      const res = await login(email, "wrong-password-attempt");
      expect(res.status).toBe(401);
    }

    const blocked = await login(email, "wrong-password-attempt");
    expect(blocked.status).toBe(429);
    expect(blocked.body.message).toMatch(/too many/i);

    // Even the correct password waits until the window passes.
    const correct = await login(email);
    expect(correct.status).toBe(429);

    const logged = await prisma.auditLog.count({
      where: {
        action: "AUTH_LOGIN",
        outcome: "DENIED",
        userId: null,
      },
    });

    expect(logged).toBeGreaterThanOrEqual(1);
  });
});

describe("register rate limit", () => {
  beforeAll(() => {
    process.env.TEST_RATE_LIMITS = "on";
  });

  afterAll(() => {
    delete process.env.TEST_RATE_LIMITS;
  });

  it("limits repeated sign-ups from one address and logs it", async () => {
    let limited = 0;

    // The limit is 10 per hour. Earlier tests in this file already used some.
    for (let attempt = 0; attempt < 12; attempt++) {
      const res = await register(uniqueEmail(`flood${attempt}`));

      if (res.status === 429) limited++;
    }

    expect(limited).toBeGreaterThanOrEqual(1);

    const logged = await prisma.auditLog.count({
      where: {
        action: "AUTH_REGISTER",
        outcome: "DENIED",
        userId: null,
      },
    });

    expect(logged).toBeGreaterThanOrEqual(1);
  });
});
