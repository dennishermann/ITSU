type Provider = 'removebg' | 'clipdrop' | 'none';

function toArrayBuffer(view: Uint8Array): ArrayBuffer {
	const ab = new ArrayBuffer(view.byteLength);
	new Uint8Array(ab).set(view);
	return ab;
}

async function callRemoveBg(input: Uint8Array): Promise<Uint8Array> {
	const apiKey = process.env.BG_REMOVE_API_KEY;
	if (!apiKey) throw new Error('no-removebg-key');
	const form = new FormData();
	form.append('image_file', new Blob([toArrayBuffer(input)]), 'image.png');
	form.append('size', 'auto');
	const res = await fetch('https://api.remove.bg/v1.0/removebg', {
		method: 'POST',
		headers: { 'X-Api-Key': apiKey },
		body: form,
	});
	if (!res.ok) {
		const status = res.status;
		const text = await res.text();
		const err: Error & { status?: number } = new Error(`remove.bg failed: ${status} ${text}`);
		err.status = status;
		throw err;
	}
	const arrayBuf = await res.arrayBuffer();
	return new Uint8Array(arrayBuf);
}

async function callClipDrop(input: Uint8Array): Promise<Uint8Array> {
	const apiKey = process.env.CLIPDROP_API_KEY;
	if (!apiKey) throw new Error('no-clipdrop-key');
	const form = new FormData();
	form.append('image_file', new Blob([toArrayBuffer(input)]), 'image.png');
	const res = await fetch('https://clipdrop-api.co/remove-background/v1', {
		method: 'POST',
		headers: { 'x-api-key': apiKey },
		body: form,
	});
	if (!res.ok) {
		const status = res.status;
		const text = await res.text();
		const err: Error & { status?: number } = new Error(`clipdrop failed: ${status} ${text}`);
		err.status = status;
		throw err;
	}
	const arrayBuf = await res.arrayBuffer();
	return new Uint8Array(arrayBuf);
}

export async function removeBackgroundWithFallback(input: Uint8Array): Promise<{ buffer: Uint8Array; provider: Provider }> {
	// Try remove.bg
	try {
		const out = await callRemoveBg(input);
		return { buffer: out, provider: 'removebg' };
	} catch (e) {
		const status = (e as { status?: number } | undefined)?.status;
		if (status && (status === 402 || status === 429 || (status >= 400 && status < 500))) {
			// fall through to next provider
		} else {
			// transient error, try next anyway
		}
	}

	// Try ClipDrop
	try {
		const out = await callClipDrop(input);
		return { buffer: out, provider: 'clipdrop' };
	} catch {
		// continue to none
	}

	return { buffer: input, provider: 'none' };
}


