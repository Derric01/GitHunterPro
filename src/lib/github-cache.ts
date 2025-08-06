// GitHub API utilities with caching and rate limiting
interface CacheItem {
  data: unknown;
  timestamp: number;
  expires: number;
}

class GitHubAPICache {
  private cache = new Map<string, CacheItem>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: unknown) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expires: Date.now() + this.CACHE_DURATION
    });
  }

  get(key: string) {
    const item = this.cache.get(key);
    if (!item || Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  clear() {
    this.cache.clear();
  }
}

export const githubCache = new GitHubAPICache();

export const fetchWithCache = async (url: string) => {
  // Check cache first
  const cachedData = githubCache.get(url);
  if (cachedData) {
    return cachedData;
  }

  // Fetch from API
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const data = await response.json();
  githubCache.set(url, data);
  return data;
};
