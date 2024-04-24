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
		<a class="navbar-brand" href="/">Home</a>
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
					class:active={$page.url.pathname === '/'}
					data-sveltekit-preload-data
					href="/">Page 2</a
				>

				<a
					class="nav-link"
					class:active={$page.url.pathname === '/admin'}
					data-sveltekit-preload-data
					href="/admin">Admin</a
				>
			</div>
		</div>
	</div>
</nav>

<main class="container">
	<slot />
</main>
