import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'ssdp_cache_';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

interface CachedData<T> {
  data: T;
  timestamp: number;
}

/**
 * Get cached data. Returns null if cache is expired or missing.
 */
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;

    const cached: CachedData<T> = JSON.parse(raw);
    const age = Date.now() - cached.timestamp;

    if (age > CACHE_TTL) {
      await AsyncStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }

    return cached.data;
  } catch {
    return null;
  }
}

/**
 * Save data to cache with current timestamp.
 */
export async function setCache<T>(key: string, data: T): Promise<void> {
  try {
    const cached: CachedData<T> = { data, timestamp: Date.now() };
    await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(cached));
  } catch {
    // Silently fail — caching is best-effort
  }
}

/**
 * Fetch with cache-first strategy:
 * 1. Return cached data immediately if available
 * 2. Fetch fresh data in the background
 * 3. Update cache with fresh data
 *
 * Returns { data, fromCache }
 */
export async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<{ data: T; fromCache: boolean }> {
  // Try cache first
  const cached = await getCached<T>(key);
  if (cached !== null) {
    // Refresh in background (fire-and-forget)
    fetcher().then((fresh) => setCache(key, fresh)).catch(() => {});
    return { data: cached, fromCache: true };
  }

  // No cache — fetch fresh
  const data = await fetcher();
  await setCache(key, data);
  return { data, fromCache: false };
}

/**
 * Clear all cached data.
 */
export async function clearAllCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((k) => k.startsWith(CACHE_PREFIX));
    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
    }
  } catch {
    // Silently fail
  }
}
