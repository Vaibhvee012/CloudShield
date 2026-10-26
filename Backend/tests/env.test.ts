import { afterEach, describe, expect, it, vi } from "vitest";
import { validateEnvironment } from "../src/config/env";

const originalNodeEnv = process.env.NODE_ENV;
const originalSecret = process.env.JWT_SECRET;
const originalAws = process.env.AWS_REGION;

afterEach(() => {
  process.env.NODE_ENV = originalNodeEnv;
  process.env.JWT_SECRET = originalSecret;
  process.env.AWS_REGION = originalAws;
  vi.restoreAllMocks();
});

describe("validateEnvironment", () => {
  it("passes with a strong secret", () => {
    process.env.JWT_SECRET = "x".repeat(40);

    expect(() => validateEnvironment()).not.toThrow();
  });

  it("refuses a short secret in production", () => {
    process.env.NODE_ENV = "production";
    process.env.JWT_SECRET = "short-secret";

    expect(() => validateEnvironment()).toThrow(/JWT_SECRET/);
  });

  it("refuses a placeholder secret in production", () => {
    process.env.NODE_ENV = "production";
    process.env.JWT_SECRET = "changeme";

    expect(() => validateEnvironment()).toThrow(/JWT_SECRET/);
  });

  it("accepts a strong secret in production", () => {
    process.env.NODE_ENV = "production";
    process.env.JWT_SECRET = "a-long-random-production-secret-0123456789";

    expect(() => validateEnvironment()).not.toThrow();
  });

  it("only warns about a weak secret outside production", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    process.env.NODE_ENV = "development";
    process.env.JWT_SECRET = "short";

    expect(() => validateEnvironment()).not.toThrow();
    expect(warn).toHaveBeenCalled();
  });

  it("reports missing variables", () => {
    delete process.env.AWS_REGION;

    expect(() => validateEnvironment()).toThrow(/AWS_REGION/);
  });
});
