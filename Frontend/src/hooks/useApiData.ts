import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, getSecurityPosture } from "../services/api";
import type { ApiResponse } from "../services/api";

export type ConnectionState = "NOT_CONNECTED" | "NO_DATA" | "READY";

/*
 * Loads data from an API function and exposes loading, error and reload.
 * The error is the server's own message when there is one.
 */
export function useApiData<T>(
  fetcher: () => Promise<ApiResponse>,
  fallbackError: string
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const mounted = useRef(true);

  const load = useCallback(async () => {
    try {
      const response = await fetcher();

      if (!mounted.current) return;

      setData((response?.data ?? null) as T | null);
      setError("");
    } catch (err) {
      if (!mounted.current) return;

      setError(err instanceof ApiError ? err.message : fallbackError);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [fetcher, fallbackError]);

  useEffect(() => {
    mounted.current = true;
    load();

    return () => {
      mounted.current = false;
    };
  }, [load]);

  const reload = useCallback(() => {
    setLoading(true);
    setError("");
    return load();
  }, [load]);

  return { data, loading, error, reload };
}

/*
 * Whether this user has connected AWS and scanned anything yet.
 * null while unknown, so pages can fall back to a neutral message.
 */
export function useConnectionState(): ConnectionState | null {
  const { data } = useApiData<{ state?: ConnectionState }>(
    getSecurityPosture,
    ""
  );

  return data?.state ?? null;
}