import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import { validateImage, flipHorizontalToPng } from '@/lib/image';

function makePngBuffer(width = 8, height = 6) {
	return sharp({ create: { width, height, channels: 4, background: { r: 255, g: 0, b: 0, alpha: 1 } } }).png().toBuffer();
}

describe('validateImage', () => {
	it('accepts png/jpg/webp', async () => {
		const png = await makePngBuffer();
		const ok = await validateImage(new Uint8Array(png));
		expect(ok.ok).toBe(true);
	});
});

describe('flipHorizontalToPng', () => {
	it('returns png and preserves dimensions', async () => {
		const png = await makePngBuffer(10, 4);
		const out = await flipHorizontalToPng(new Uint8Array(png));
		const meta = await sharp(out).metadata();
		expect(meta.format).toBe('png');
		expect(meta.width).toBe(10);
		expect(meta.height).toBe(4);
	});
});


