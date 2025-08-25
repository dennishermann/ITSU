import { globalCleanup } from '@/lib/cleanup';

export const runtime = 'nodejs';

export async function GET(req: Request) {
	const token = process.env.CLEANUP_TOKEN;
	const authHeader = req.headers.get('authorization') || '';
	const url = new URL(req.url);
	const keyQuery = url.searchParams.get('key');
	if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 });
	const hasAuth = authHeader === `Bearer ${token}` || keyQuery === token;
	if (!hasAuth) return Response.json({ error: 'Unauthorized' }, { status: 401 });
	const deleted = await globalCleanup();
	return Response.json({ deleted });
}
