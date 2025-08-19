import { getSupabaseAdmin, removeObjects } from './storage';

export function getTtlDays(): number {
	const days = Number(process.env.TTL_DAYS || '7');
	return Number.isFinite(days) && days > 0 ? days : 7;
}

export async function lazyCleanupForSid(sid: string): Promise<void> {
	const days = getTtlDays();
	const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
	const { data, error } = await getSupabaseAdmin()
		.from('images')
		.select('id, processed_path')
		.eq('sid', sid)
		.lt('created_at', cutoff);
	if (error || !data) return;
	if (data.length === 0) return;
	await removeObjects(data.map((r) => r.processed_path));
	await getSupabaseAdmin().from('images').delete().in('id', data.map((r) => r.id));
}

export async function globalCleanup(): Promise<number> {
	const days = getTtlDays();
	const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
	const { data, error } = await getSupabaseAdmin()
		.from('images')
		.select('id, processed_path')
		.lt('created_at', cutoff);
	if (error || !data) return 0;
	if (data.length === 0) return 0;
	await removeObjects(data.map((r) => r.processed_path));
	await getSupabaseAdmin().from('images').delete().in('id', data.map((r) => r.id));
	return data.length;
}


