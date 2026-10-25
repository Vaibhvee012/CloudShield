import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../src/app";

describe("health and routing", () => {
  it("reports that the API is running", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true });
  });

  it("returns a JSON 404 for unknown API routes", async () => {
    const res = await request(app).get("/api/does-not-exist");

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ success: false });
  });

  it("sets security headers and hides the framework", async () => {
    const res = await request(app).get("/api/health");

    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });

  it("only allows the configured frontend origin", async () => {
    const allowed = await request(app)
      .get("/api/health")
      .set("Origin", "http://localhost:5173");

    const other = await request(app)
      .get("/api/health")
      .set("Origin", "https://evil.example");

    // The header always names the configured origin, never "*" and never
    // the requesting site, so browsers block other origins.
    expect(allowed.headers["access-control-allow-origin"]).toBe(
      "http://localhost:5173"
    );
    expect(other.headers["access-control-allow-origin"]).toBe(
      "http://localhost:5173"
    );
  });
});
