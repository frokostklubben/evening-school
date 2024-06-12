import cookie from 'cookie';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	// Parse cookies from the request header
	const cookies = cookie.parse(event.request.headers.get('cookie') || '');
	const sessionId = cookies.sessionId;
	const roleIdFromCookies = cookies.roleId;

	// Public paths that do not require authentication
	const publicPaths = ['/', '/reset-password'];

	const userPaths = [
		'/booking',
		'/edit-booking',
		'/location/user',
		'/room-search',
		'/users/user',
		'/holiday',
		'/classroom-history',
		'/classroom/user'
	];

	const adminPaths = ['/classrooms/admin', '/users/admin', '/location/admin'];

	if (!sessionId && !publicPaths.some((path) => event.url.pathname.startsWith(path))) {
		return new Response(null, { status: 302, headers: { location: '/' } });
	}

	// Check if the user is trying to access an admin path without admin role
	if (adminPaths.some((path) => event.url.pathname.startsWith(path)) && roleIdFromCookies !== '1') {
		return new Response(null, {
			status: 302,
			headers: { location: '/error' }
		});
	}

	// Check if the user is trying to access a user path without user role
	if (userPaths.some((path) => event.url.pathname.startsWith(path)) && roleIdFromCookies !== '2') {
		return new Response(null, {
			status: 302,
			headers: { location: '/error' }
		});
	}

	// Continue resolving the request
	return await resolve(event);
}
