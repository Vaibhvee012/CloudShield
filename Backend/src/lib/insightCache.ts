type CacheEntry = {
  insight: string;
  fingerprint: string;
  expiresAt: number;
};

const TTL_MS = 5 * 60 * 1000;
const MAX_ENTRIES = 500;

// In-memory: cleared on restart and not shared between server instances.
const cache = new Map<string, CacheEntry>();

export const getCachedInsight = (
  userId: string,
  fingerprint: string
): string | null => {
  const entry = cache.get(userId);

  if (!entry) return null;

  if (entry.expiresAt < Date.now() || entry.fingerprint !== fingerprint) {
    cache.delete(userId);
    return null;
  }

  return entry.insight;
};

export const setCachedInsight = (
  userId: string,
  fingerprint: string,
  insight: string
) => {
  if (cache.size >= MAX_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }

  cache.set(userId, {
    insight,
    fingerprint,
    expiresAt: Date.now() + TTL_MS,
  });
};