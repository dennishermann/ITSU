import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
	const res = NextResponse.next();
	let sid = req.cookies.get('sid')?.value;
	if (!sid) {
		sid = crypto.randomUUID();
		res.cookies.set('sid', sid, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 90,
			path: '/',
		});
	}
	return res;
}

export const config = {
	matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};


