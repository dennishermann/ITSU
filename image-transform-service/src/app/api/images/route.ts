import { NextRequest } from 'next/server';
import { getOrSetSid } from '@/lib/session';
import { lazyCleanupForSid } from '@/lib/cleanup';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest) {
	const sid = await getOrSetSid();
	lazyCleanupForSid(sid).catch(() => {});
	const url = new URL(`${process.env.SUPABASE_URL}/rest/v1/images`);
	url.searchParams.set('select', 'id,processed_url,original_filename,created_at');
	url.searchParams.set('sid', `eq.${sid}`);
	url.searchParams.set('order', 'created_at.desc');
	const res = await fetch(url.toString(), {
		headers: {
			'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
			'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
		},
	});
	if (!res.ok) return Response.json({ items: [] });
	const items = await res.json();
	return Response.json({ items });
}


