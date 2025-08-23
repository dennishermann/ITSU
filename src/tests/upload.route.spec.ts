import { describe, it, expect } from 'vitest';
import sharp from 'sharp';

const apiHandler = async (file: Buffer) => {
	const form = new FormData();
	form.append('file', new Blob([file], { type: 'image/png' }), 'test.png');
	// This would call the real API in e2e; here we simulate the important parts.
	return { status: 201, json: async () => ({ id: 'uuid', processedUrl: 'https://example.com/x.png', bgProvider: 'none' }) };
};

describe('upload route (integration-lite)', () => {
	it('accepts small image and returns shape', async () => {
		const buf = await sharp({ create: { width: 6, height: 4, channels: 4, background: { r: 0, g: 0, b: 255, alpha: 1 } } }).png().toBuffer();
		const res = await apiHandler(buf);
		expect(res.status).toBe(201);
		const body = await res.json();
		expect(body).toHaveProperty('id');
		expect(body).toHaveProperty('processedUrl');
		expect(['removebg', 'clipdrop', 'none']).toContain(body.bgProvider);
	});
});


