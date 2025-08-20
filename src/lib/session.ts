import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';

export async function getOrSetSid(): Promise<string> {
	const store = await cookies();
	let sid = store.get('sid')?.value;
	if (!sid) {
		sid = randomUUID();
		store.set('sid', sid, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 90,
			path: '/',
		});
	}
	return sid;
}


