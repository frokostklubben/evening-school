import { validateServerSession } from './utils/auth.js';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	const sid = event.cookies.get('sid'); // Hent session ID fra cookies
	const user = await validateServerSession(sid);

	event.locals.user = user;

	if (!user && event.url.pathname !== '/' && !event.url.pathname.startsWith('/reset-password')) {
		return new Response(null, { status: 302, headers: { location: '/' } });
	}

	return await resolve(event);
}
