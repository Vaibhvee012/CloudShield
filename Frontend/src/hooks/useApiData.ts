import { useCallback, useEffect, useState } from "react";
import { ApiError, getSecurityPosture } from "../services/api";
import type { ApiResponse } from "../services/api";

export type ConnectionState = "NOT_CONNECTED" | "NO_DATA" | "READY";

/*
 * Loads data from an API function and exposes loading, error and reload.
 * The error is the server's own message when there is one.
 * State is only set inside promise callbacks, never directly in the effect.
 */
export function useApiData<T>(
  fetcher: () => Promise<ApiResponse>,
  fallbackError: string
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    fetcher()
      .then((response) => {
        if (!active) return;

        setData((response?.data ?? null) as T | null);
        setError("");
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;

        setError(err instanceof ApiError ? err.message : fallbackError);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [fetcher, fallbackError, reloadKey]);

  const reload = useCallback(() => {
    setLoading(true);
    setError("");
    setReloadKey((key) => key + 1);
  }, []);

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