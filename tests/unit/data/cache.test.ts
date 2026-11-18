import { TTLCache } from '@/lib/data/cache';

describe('TTLCache', () => {
  it('stores and retrieves values', () => {
    const cache = new TTLCache<string>(60000);
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
  });

  it('returns undefined for missing keys', () => {
    const cache = new TTLCache<string>(60000);
    expect(cache.get('missing')).toBeUndefined();
  });

  it('expires entries after TTL', () => {
    const cache = new TTLCache<string>(0);
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBeUndefined();
  });

  it('deduplicates in-flight requests', async () => {
    const cache = new TTLCache<number>(60000);
    let callCount = 0;
    const fetcher = () =>
      new Promise<number>((resolve) => {
        callCount++;
        setTimeout(() => resolve(42), 10);
      });
    const [a, b] = await Promise.all([
      cache.getOrFetch('key1', fetcher),
      cache.getOrFetch('key1', fetcher),
    ]);
    expect(a).toBe(42);
    expect(b).toBe(42);
    expect(callCount).toBe(1);
  });

  it('getOrFetch returns cached value without calling fetcher', async () => {
    const cache = new TTLCache<string>(60000);
    cache.set('key1', 'cached');
    let called = false;
    const result = await cache.getOrFetch('key1', async () => {
      called = true;
      return 'fresh';
    });
    expect(result).toBe('cached');
    expect(called).toBe(false);
  });

  it('getOrFetch cleans up inflight on error', async () => {
    const cache = new TTLCache<string>(60000);
    await expect(cache.getOrFetch('key1', () => Promise.reject(new Error('fail')))).rejects.toThrow(
      'fail',
    );
    const result = await cache.getOrFetch('key1', async () => 'recovered');
    expect(result).toBe('recovered');
  });

  it('clear removes all entries', () => {
    const cache = new TTLCache<string>(60000);
    cache.set('a', '1');
    cache.set('b', '2');
    cache.clear();
    expect(cache.get('a')).toBeUndefined();
    expect(cache.get('b')).toBeUndefined();
  });
});
