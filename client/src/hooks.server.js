import cookie from 'cookie';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	const cookies = cookie.parse(event.request.headers.get('cookie') || '');
	const sessionId = cookies.sessionId;
	const roleIdFromCookies = cookies.roleId;

	const publicPaths = ['/', '/reset-password', '/error'];

	const userPaths = [
		'/booking',
		'/edit-booking',
		'/location/user',
		'/room-search',
		'/users/user',
		'/holiday',
		'/classroom-history',
		'/classrooms/user'
	];

	const adminPaths = ['/classrooms/admin', '/users/admin', '/location/admin'];

	if (!sessionId && !publicPaths.some((path) => event.url.pathname.startsWith(path))) {
		return new Response(null, { status: 302, headers: { location: '/' } });
	}

	if (adminPaths.some((path) => event.url.pathname.startsWith(path)) && roleIdFromCookies !== '1') {
		return new Response(null, {
			status: 302,
			headers: { location: '/error' }
		});
	}

	if (userPaths.some((path) => event.url.pathname.startsWith(path)) && roleIdFromCookies !== '2') {
		return new Response(null, {
			status: 302,
			headers: { location: '/error' }
		});
	}

	return await resolve(event);
}
