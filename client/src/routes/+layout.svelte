<script>
	import 'bootstrap/dist/css/bootstrap.css';
	import { page } from '$app/stores';

	let isOpen = false;

	function toggleOpen() {
		isOpen = !isOpen;
	}
</script>

<nav class="navbar navbar-expand-lg bg-body-tertiary">
	<div class="container-fluid">
		<a class="navbar-brand" href="/">Aftenskolerne</a>
		<button
			on:click={toggleOpen}
			class="navbar-toggler"
			type="button"
			data-bs-toggle="collapse"
			data-bs-target="#navbarNavAltMarkup"
			aria-controls="navbarNavAltMarkup"
			aria-expanded="false"
			aria-label="Toggle navigation"
		>
			<span class="navbar-toggler-icon"></span>
		</button>
		<div class:show={isOpen} class="collapse navbar-collapse" id="navbarNavAltMarkup">
			<div class="navbar-nav">
				<a
					class="nav-link"
					aria-current="page"
					class:active={$page.url.pathname === '/booking'}
					data-sveltekit-preload-data
					href="/booking">Booking</a
				>

				<a
					class="nav-link"
					class:active={$page.url.pathname === '/event'}
					data-sveltekit-preload-data
					href="/event">Event</a
				>

				<!-- <a
					class="nav-link"
					class:active={$page.url.pathname === '/admin'}
					data-sveltekit-preload-data
					href="/admin">Admin</a
				> -->

				<a
					class="nav-link"
					class:active={$page.url.pathname === '/courses'}
					data-sveltekit-preload-data
					href="/courses">Hold</a
				>

				<a
					class="nav-link"
					class:active={$page.url.pathname === '/users'}
					data-sveltekit-preload-data
					href="/users">Kontoransatte</a
				>
				<!-- <a
					class="nav-link"
					class:active={$page.url.pathname === '/add-location'}
					data-sveltekit-preload-data
					href="/add-location">add location</a
				> -->
				<!-- <a
					class="nav-link"
					class:active={$page.url.pathname === '/show-users'}
					data-sveltekit-preload-data
					href="/show-users">Ansatte</a
				> -->
				<a
					class="nav-link"
					class:active={$page.url.pathname === '/afdelinger'}
					data-sveltekit-preload-data
					href="/location">Afdelinger</a
				>
			</div>
		</div>
	</div>
</nav>

<main class="container">
	<slot />
</main>
