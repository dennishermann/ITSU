import sharp from 'sharp';
import { fileTypeFromBuffer } from 'file-type';

const MAX_BYTES = 10 * 1024 * 1024;

export async function validateImage(buffer: Uint8Array | Buffer): Promise<{ ok: true; ext: 'png' | 'jpg' | 'jpeg' | 'webp' } | { ok: false; error: string }> {
	if (!buffer || buffer.length === 0) return { ok: false, error: 'Empty file' };
	if (buffer.length > MAX_BYTES) return { ok: false, error: 'File is larger than 10 MB' };
	const ft = await fileTypeFromBuffer(buffer);
	const mime = ft?.mime || '';
	if (!['image/png', 'image/jpeg', 'image/webp'].includes(mime)) {
		return { ok: false, error: 'Only PNG, JPEG, or WebP are allowed' };
	}
	const ext = (ft?.ext || '').toLowerCase() as 'png' | 'jpg' | 'jpeg' | 'webp';
	return { ok: true, ext };
}

export async function flipHorizontalToPng(buffer: Uint8Array): Promise<Buffer> {
	return await sharp(buffer).flop().png().toBuffer();
}


