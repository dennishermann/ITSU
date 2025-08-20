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
		const reqId = randomUUID();
		console.log('[upload] start', { reqId, sid });
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
			console.log('[upload] bg-remove result', { reqId, provider: bgProvider, inputBytes: inputBuffer.byteLength, outputBytes: processedInput.byteLength });
		} catch (e) {
			bgProvider = 'none';
			console.error('[upload] background removal failed, proceeding with original', { reqId }, e);
		}

		let flipped: Buffer;
		try {
			flipped = await flipHorizontalToPng(processedInput);
		} catch (e) {
			console.error('[upload] sharp flip failed', { reqId }, e);
			return Response.json({ error: 'Image processing failed' }, { status: 500 });
		}
		const id = randomUUID();
		const path = `processed/${sid}/${id}.png`;
		try {
			await uploadPng(path, flipped);
		} catch (e) {
			console.error('[upload] storage upload failed', { reqId, path }, e);
			return Response.json({ error: 'Storage upload failed' }, { status: 500 });
		}
		const url = publicUrl(path);

		await lazyCleanupForSid(sid).catch(() => {});

		// Insert row
		try {
			const ins = await fetch(`${process.env.SUPABASE_URL}/rest/v1/images`, {
				method: 'POST',
				headers: {
					'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
					'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
					'Content-Type': 'application/json',
					'Prefer': 'return=representation',
				},
				body: JSON.stringify({ id, sid, original_filename: (file as File).name || null, processed_path: path, processed_url: url }),
			});
			if (!ins.ok) {
				console.error('[upload] db insert failed', { reqId, status: ins.status, statusText: ins.statusText });
			}
		} catch (e) {
			console.error('[upload] db insert threw', { reqId }, e);
		}

		console.log('[upload] done', { reqId, provider: bgProvider, id, path });
		return Response.json({ id, processedUrl: url, bgProvider }, { status: 201 });
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : '';
		const isProviderError = /remove\.bg|clipdrop/.test(msg);
		console.error('[upload] unhandled error', { message: msg });
		return Response.json({ error: isProviderError ? 'Background removal failed' : 'Internal error' }, { status: isProviderError ? 502 : 500 });
	}
}


