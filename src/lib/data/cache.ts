export class TTLCache<T> {
  private store = new Map<string, { data: T; expiresAt: number }>();
  private inflight = new Map<string, Promise<T>>();

  constructor(private readonly ttlMs: number) {}

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() >= entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.data;
  }

  set(key: string, data: T): void {
    this.store.set(key, { data, expiresAt: Date.now() + this.ttlMs });
  }

  /** Deduplicate concurrent requests for the same key */
  async getOrFetch(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.get(key);
    if (cached !== undefined) return cached;
    const existing = this.inflight.get(key);
    if (existing) return existing;
    const promise = fetcher()
      .then((data) => {
        this.set(key, data);
        this.inflight.delete(key);
        return data;
      })
      .catch((err: unknown) => {
        this.inflight.delete(key);
        throw err;
      });
    this.inflight.set(key, promise);
    return promise;
  }

  clear(): void {
    this.store.clear();
    this.inflight.clear();
  }
}
