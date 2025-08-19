import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const BUCKET_NAME = 'processed';

let _admin: SupabaseClient | null = null;
export function getSupabaseAdmin(): SupabaseClient {
	if (_admin) return _admin;
	const supabaseUrl = process.env.SUPABASE_URL;
	const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
	if (!supabaseUrl || !serviceKey) throw new Error('Supabase env not set');
	_admin = createClient(supabaseUrl, serviceKey, {
		auth: { persistSession: false, autoRefreshToken: false },
	});
	return _admin;
}

export async function uploadPng(path: string, buffer: Buffer) {
	const { error } = await getSupabaseAdmin().storage.from(BUCKET_NAME).upload(path, buffer, {
		contentType: 'image/png',
		upsert: false,
	});
	if (error) throw error;
}

export function publicUrl(path: string): string {
	const { data } = getSupabaseAdmin().storage.from(BUCKET_NAME).getPublicUrl(path);
	return data.publicUrl;
}

export async function removeObjects(paths: string[]): Promise<void> {
	if (paths.length === 0) return;
	const { error } = await getSupabaseAdmin().storage.from(BUCKET_NAME).remove(paths);
	if (error) throw error;
}


