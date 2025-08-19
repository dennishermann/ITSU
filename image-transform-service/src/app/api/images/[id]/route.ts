import { NextRequest } from 'next/server';
import { getOrSetSid } from '@/lib/session';
import { getSupabaseAdmin, removeObjects } from '@/lib/storage';

export const runtime = 'nodejs';

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
	const sid = await getOrSetSid();
	const { id } = await context.params;
	// Get row
	const { data, error } = await getSupabaseAdmin()
		.from('images')
		.select('id, sid, processed_path')
		.eq('id', id)
		.single();
	if (error || !data) return new Response(null, { status: 404 });
	if (data.sid !== sid) return new Response(null, { status: 404 });
	await removeObjects([data.processed_path]).catch(() => {});
	await getSupabaseAdmin().from('images').delete().eq('id', id);
	return new Response(null, { status: 204 });
}


