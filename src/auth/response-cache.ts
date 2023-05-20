export interface ResponseCache {
  put(url: URL, response: Response): Promise<void>;
  get(url: URL): Promise<Response | undefined>;
}

const CERT_CACHE_KEY = "publicKeys";

let responseCache: ResponseCache;

export function getResponseCache() {
  if (!responseCache) {
    return (responseCache =
      typeof caches === "undefined"
        ? new GlobalInMemoryResponseCache()
        : new WebApiResponseCache());
  }

  return responseCache;
}

export class WebApiResponseCache implements ResponseCache {
  private cache: Cache | null = null;
  private async getCache() {
    if (!this.cache) {
      return (this.cache = await caches.open(CERT_CACHE_KEY));
    }

    return this.cache;
  }
  async put(url: URL, response: Response): Promise<void> {
    const cache = await this.getCache();
    await cache.put(url, response);
  }

  async get(url: URL): Promise<Response | undefined> {
    const cache = await this.getCache();

    return cache.match(url);
  }
}

const globalInMemoryResponseMap: Map<string, Response> = new Map();

export class GlobalInMemoryResponseCache implements ResponseCache {
  async put(url: URL, response: Response): Promise<void> {
    globalInMemoryResponseMap.set(url.toString(), response);
  }

  async get(url: URL): Promise<Response | undefined> {
    return globalInMemoryResponseMap.get(url.toString());
  }
}
