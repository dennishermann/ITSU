import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('images API routes', () => {
  const originalEnv = { ...process.env } as NodeJS.ProcessEnv;
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(global as unknown as { fetch: typeof fetch }, 'fetch');
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test';
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    process.env = { ...originalEnv };
  });

  it('GET /api/images returns items array', async () => {
    vi.doMock('@/lib/session', () => ({ getOrSetSid: vi.fn().mockResolvedValue('sid-123') }));
    vi.doMock('@/lib/cleanup', () => ({ lazyCleanupForSid: vi.fn().mockResolvedValue(undefined) }));
    const { GET } = await import('@/app/api/images/route');
    fetchSpy.mockResolvedValueOnce(new Response(JSON.stringify([{ id: '1', processed_url: 'u', original_filename: 'f', created_at: 't' }]), { status: 200 }));

    const res = await GET();
    const body = await res.json();
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.items[0].id).toBe('1');
    expect(fetchSpy).toHaveBeenCalledOnce();
  });

  it('GET /api/images tolerates non-OK', async () => {
    vi.doMock('@/lib/session', () => ({ getOrSetSid: vi.fn().mockResolvedValue('sid-123') }));
    vi.doMock('@/lib/cleanup', () => ({ lazyCleanupForSid: vi.fn().mockResolvedValue(undefined) }));
    const { GET } = await import('@/app/api/images/route');
    fetchSpy.mockResolvedValueOnce(new Response('', { status: 500 }));
    const res = await GET();
    const body = await res.json();
    expect(body.items).toEqual([]);
  });
});


