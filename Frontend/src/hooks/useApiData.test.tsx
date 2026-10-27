import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../services/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../services/api")>()),
  getSecurityPosture: vi.fn(),
}));

import { ApiError, getSecurityPosture } from "../services/api";
import { useApiData, useConnectionState } from "./useApiData";

describe("useApiData", () => {
  it("starts loading, then returns the data", async () => {
    const fetcher = vi.fn().mockResolvedValue({ data: ["one", "two"] });

    const { result } = renderHook(() =>
      useApiData<string[]>(fetcher, "Fallback")
    );

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual(["one", "two"]);
    expect(result.current.error).toBe("");
  });

  it("shows the server's message when the request fails", async () => {
    const fetcher = vi
      .fn()
      .mockRejectedValue(new ApiError(429, "Too many requests"));

    const { result } = renderHook(() =>
      useApiData<string[]>(fetcher, "Fallback")
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Too many requests");
    expect(result.current.data).toBeNull();
  });

  it("uses the fallback message for an unexpected error", async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error("something internal"));

    const { result } = renderHook(() =>
      useApiData<string[]>(fetcher, "Could not load things")
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Could not load things");
  });

  it("loads again when reload is called", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce({ data: ["first"] })
      .mockResolvedValueOnce({ data: ["second"] });

    const { result } = renderHook(() =>
      useApiData<string[]>(fetcher, "Fallback")
    );

    await waitFor(() => expect(result.current.data).toEqual(["first"]));

    act(() => result.current.reload());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.data).toEqual(["second"]));

    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("recovers after a failure when retried", async () => {
    const fetcher = vi
      .fn()
      .mockRejectedValueOnce(new ApiError(500, "Server error"))
      .mockResolvedValueOnce({ data: ["ok"] });

    const { result } = renderHook(() =>
      useApiData<string[]>(fetcher, "Fallback")
    );

    await waitFor(() => expect(result.current.error).toBe("Server error"));

    act(() => result.current.reload());

    await waitFor(() => expect(result.current.data).toEqual(["ok"]));

    expect(result.current.error).toBe("");
  });
});

describe("useConnectionState", () => {
  it("is null while loading, then the account state", async () => {
    vi.mocked(getSecurityPosture).mockResolvedValue({
      data: { state: "NO_DATA" },
    });

    const { result } = renderHook(() => useConnectionState());

    expect(result.current).toBeNull();

    await waitFor(() => expect(result.current).toBe("NO_DATA"));
  });

  it("stays null when the request fails, so pages show a neutral message", async () => {
    vi.mocked(getSecurityPosture).mockRejectedValue(new Error("down"));

    const { result } = renderHook(() => useConnectionState());

    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(result.current).toBeNull();
  });
});
