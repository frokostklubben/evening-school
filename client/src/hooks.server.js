/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	if (event.url.pathname !== '/' && !event.url.pathname.startsWith('/reset-password')) {
		return new Response(null, { status: 302, headers: { location: '/' } });
	}

	return await resolve(event);
}
