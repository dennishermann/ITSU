import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { removeBackgroundWithFallback } from '@/lib/bgRemove';

const dummy = Buffer.from([137, 80, 78, 71]);

describe('removeBackgroundWithFallback', () => {
	const originalFetch = global.fetch;
	beforeEach(() => {
		(global as unknown as { fetch: unknown }).fetch = vi.fn();
	});
	afterEach(() => {
		(global as unknown as { fetch: unknown }).fetch = originalFetch as unknown as typeof fetch;
		vi.restoreAllMocks();
	});

	it('remove.bg success', async () => {
		process.env.BG_REMOVE_API_KEY = 'x';
		(global.fetch as unknown as { mockResolvedValueOnce: (v: unknown) => unknown }).mockResolvedValueOnce(new Response(dummy, { status: 200 }));
		const res = await removeBackgroundWithFallback(dummy);
		expect(res.provider).toBe('removebg');
	});

	it('remove.bg fails → clipdrop success', async () => {
		process.env.BG_REMOVE_API_KEY = 'x';
		process.env.CLIPDROP_API_KEY = 'y';
		(global.fetch as unknown as { mockResolvedValueOnce: (v: unknown) => unknown })
			.mockResolvedValueOnce(new Response('quota', { status: 402 }))
			.mockResolvedValueOnce(new Response(dummy, { status: 200 }));
		const res = await removeBackgroundWithFallback(dummy);
		expect(res.provider).toBe('clipdrop');
	});

	it('both fail → none', async () => {
		process.env.BG_REMOVE_API_KEY = 'x';
		process.env.CLIPDROP_API_KEY = 'y';
		(global.fetch as unknown as { mockResolvedValueOnce: (v: unknown) => unknown })
			.mockResolvedValueOnce(new Response('quota', { status: 402 }))
			.mockResolvedValueOnce(new Response('quota', { status: 402 }));
		const res = await removeBackgroundWithFallback(dummy);
		expect(res.provider).toBe('none');
		expect(res.buffer).toBe(dummy);
	});
});


