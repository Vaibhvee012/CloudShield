import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ApiError,
  SESSION_NOTICE_KEY,
  TOKEN_KEY,
  USER_KEY,
  connectAWS,
  getAuditLogs,
  getFindings,
  navigation,
  signOut,
} from "./api";

type Call = [
  string,
  { method: string; headers: Record<string, string>; body?: string },
];

const fetchMock = vi.fn();

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const lastCall = () => fetchMock.mock.calls.at(-1) as Call;

let toLogin: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  toLogin = vi.spyOn(navigation, "toLogin").mockImplementation(() => {});
});

describe("requests", () => {
  it("sends the saved token as a bearer token", async () => {
    localStorage.setItem(TOKEN_KEY, "my-token");
    fetchMock.mockResolvedValue(jsonResponse({ success: true, data: [] }));

    await getFindings();

    const [url, init] = lastCall();

    expect(url).toMatch(/\/findings$/);
    expect(init.method).toBe("GET");
    expect(init.headers.Authorization).toBe("Bearer my-token");
  });

  it("sends no Authorization header when signed out", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ success: true, data: [] }));

    await getFindings();

    expect(lastCall()[1].headers).not.toHaveProperty("Authorization");
  });

  it("returns the parsed response", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ success: true, data: [{ id: "f1" }] })
    );

    await expect(getFindings()).resolves.toEqual({
      success: true,
      data: [{ id: "f1" }],
    });
  });

  it("posts a JSON body with the right content type", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ success: true }));

    const connection = {
      accountId: "123456789012",
      roleArn: "arn:aws:iam::123456789012:role/Test",
      region: "us-east-1",
    };

    await connectAWS(connection);

    const [url, init] = lastCall();

    expect(url).toMatch(/\/aws\/connect$/);
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(init.body ?? "{}")).toEqual(connection);
  });

  it("builds the audit log query from the filters that are set", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ success: true, data: [] }));

    await getAuditLogs(10, { outcome: "DENIED", cursor: "abc" });

    const [url] = lastCall();

    expect(url).toContain("limit=10");
    expect(url).toContain("outcome=DENIED");
    expect(url).toContain("cursor=abc");
    expect(url).not.toContain("action=");
  });
});

describe("errors", () => {
  it("throws the server's own message", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ success: false, message: "You cannot do that" }, 403)
    );

    const failure = getFindings();

    await expect(failure).rejects.toBeInstanceOf(ApiError);
    await expect(failure).rejects.toMatchObject({
      status: 403,
      message: "You cannot do that",
    });
  });

  it("falls back to a default message when the body is not JSON", async () => {
    fetchMock.mockResolvedValue(
      new Response("<html>bad gateway</html>", {
        status: 502,
        headers: { "Content-Type": "text/html" },
      })
    );

    await expect(getFindings()).rejects.toMatchObject({
      status: 502,
      message: "Failed to fetch findings",
    });
  });

  it("reports an unreachable server clearly", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(getFindings()).rejects.toMatchObject({
      status: 0,
      message: expect.stringMatching(/unable to reach/i),
    });
  });

  it("does not sign the user out when the server is unreachable", async () => {
    localStorage.setItem(TOKEN_KEY, "my-token");
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    await getFindings().catch(() => {});

    expect(localStorage.getItem(TOKEN_KEY)).toBe("my-token");
    expect(toLogin).not.toHaveBeenCalled();
  });
});

describe("an expired or rejected session (401)", () => {
  it("clears the session, leaves a notice and goes to the login page", async () => {
    localStorage.setItem(TOKEN_KEY, "old-token");
    localStorage.setItem(USER_KEY, JSON.stringify({ name: "Test" }));
    window.history.pushState({}, "", "/dashboard");
    fetchMock.mockResolvedValue(
      jsonResponse({ success: false, message: "Invalid or expired token" }, 401)
    );

    await expect(getFindings()).rejects.toMatchObject({ status: 401 });

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(USER_KEY)).toBeNull();
    expect(sessionStorage.getItem(SESSION_NOTICE_KEY)).toMatch(/expired/i);
    expect(toLogin).toHaveBeenCalledTimes(1);
  });

  it("does not redirect when already on the login page", async () => {
    localStorage.setItem(TOKEN_KEY, "old-token");
    window.history.pushState({}, "", "/login");
    fetchMock.mockResolvedValue(jsonResponse({ success: false }, 401));

    await getFindings().catch(() => {});

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(toLogin).not.toHaveBeenCalled();
    expect(sessionStorage.getItem(SESSION_NOTICE_KEY)).toBeNull();
  });
});

describe("signOut", () => {
  it("clears the session and goes to the login page", () => {
    localStorage.setItem(TOKEN_KEY, "my-token");
    localStorage.setItem(USER_KEY, JSON.stringify({ name: "Test" }));

    signOut();

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(USER_KEY)).toBeNull();
    expect(toLogin).toHaveBeenCalledTimes(1);
    // A deliberate sign out is not an "expired session".
    expect(sessionStorage.getItem(SESSION_NOTICE_KEY)).toBeNull();
  });
});
