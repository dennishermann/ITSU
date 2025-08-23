import { describe, it, expect, vi } from 'vitest';

describe('session cookie', () => {
  it('getOrSetSid sets cookie when absent', async () => {
    vi.mock('next/headers', () => {
      const store = new Map<string, string>();
      return {
        cookies: async () => ({
          get: (k: string) => (store.has(k) ? { name: k, value: store.get(k)! } : undefined),
          set: (k: string, v: string) => { store.set(k, v); },
        }),
      };
    });
    const { getOrSetSid } = await import('@/lib/session');
    const sid = await getOrSetSid();
    expect(typeof sid).toBe('string');
    const sid2 = await getOrSetSid();
    expect(sid2).toBe(sid);
  });
});


