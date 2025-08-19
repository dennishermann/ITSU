import { NextRequest } from 'next/server';
import { getOrSetSid } from '@/lib/session';
import { validateImage, flipHorizontalToPng } from '@/lib/image';
import { removeBackgroundWithFallback } from '@/lib/bgRemove';
import { uploadPng, publicUrl } from '@/lib/storage';
import { randomUUID } from 'crypto';
import { lazyCleanupForSid } from '@/lib/cleanup';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
	try {
		const sid = await getOrSetSid();
		const form = await req.formData();
		const file = form.get('file');
		if (!file || !(file instanceof Blob)) {
			return Response.json({ error: 'Missing file' }, { status: 400 });
		}
		const arrayBuf = await file.arrayBuffer();
		const inputBuffer = new Uint8Array(arrayBuf);
		const valid = await validateImage(inputBuffer);
		if (!valid.ok) return Response.json({ error: valid.error }, { status: 400 });

		let bgProvider: 'removebg' | 'clipdrop' | 'none' = 'none';
		let processedInput: Uint8Array = inputBuffer;
		try {
			const res = await removeBackgroundWithFallback(inputBuffer);
			processedInput = res.buffer;
			bgProvider = res.provider;
		} catch {
			bgProvider = 'none';
		}

		const flipped = await flipHorizontalToPng(processedInput);
		const id = randomUUID();
		const path = `processed/${sid}/${id}.png`;
		await uploadPng(path, flipped);
		const url = publicUrl(path);

		await lazyCleanupForSid(sid).catch(() => {});

		// Insert row
		await fetch(`${process.env.SUPABASE_URL}/rest/v1/images`, {
			method: 'POST',
			headers: {
				'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
				'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
				'Content-Type': 'application/json',
				'Prefer': 'return=representation',
			},
			body: JSON.stringify({ id, sid, original_filename: (file as File).name || null, processed_path: path, processed_url: url }),
		});

		return Response.json({ id, processedUrl: url, bgProvider }, { status: 201 });
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : '';
		const isProviderError = /remove\.bg|clipdrop/.test(msg);
		return Response.json({ error: isProviderError ? 'Background removal failed' : 'Internal error' }, { status: isProviderError ? 502 : 500 });
	}
}


