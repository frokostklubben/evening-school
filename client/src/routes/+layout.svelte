<script>
	import 'bootstrap/dist/css/bootstrap.css';
	import { page } from '$app/stores';
	import { AUTH_URL } from '../stores/apiConfig.js';
	// import { login } from '../../utils/auth.js';
	let isOpen = false;
	import { user } from '../stores/userStore.js';
	import toast from 'svelte-french-toast';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let newUser = {
		email: 'admin@jensen.dk',
		password: '1'
	};

	onMount(() => {
		if (localStorage.getItem('sid')) {
			async function validateSession() {
				const sid = localStorage.getItem('sid');
				const response = await fetch(`${$AUTH_URL}/auth/validateSession`, {
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ sid })
				});

				if (response.ok) {
					const result = await response.json();
					user.set(result.data);
				} else {
					localStorage.removeItem('sid');
				}
			}

			validateSession();
		}
	});

	export async function validateUserToken() {
		try {
			const sid = localStorage.getItem('sid');
			const response = await fetch(`${$AUTH_URL}/auth/validateSession`, {
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ sid })
			});
			if (response) {
				user.set(response);
			} else {
				user.set({});

				// Invalid user found. Grab their current location to match against the publicRoutes list
				let currentLocation = window.location.pathname;

				// This will redirect if the unauthenticated user is on a private route
				if (!publicRoutes.includes(currentLocation)) {
					await goto('/');
					return false;
				}
			}
		} catch (error) {
			// User has invalid token, so log them out
			// 	await logout();
			await goto('/');
			return false;
		}
	}

	function toggleOpen() {
		isOpen = !isOpen;
	}

	async function logout() {
		user.set({});
		localStorage.removeItem('sid');
		goto('/');

		try {
			const response = await fetch(`${$AUTH_URL}/auth/logout`, {
				credentials: 'include'
			});

			if (!response.ok) {
				toast.error('Fejl ved logud, kontakt admin');
			}
		} catch (error) {
			console.error(error.message);
		}
	}

	async function login() {
		try {
			const response = await fetch(`${$AUTH_URL}/auth/login`, {
				credentials: 'include',
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(newUser)
			});

			if (response.ok) {
				const result = await response.json();
				user.set(result.data);
				localStorage.setItem('sid', result.session);
				console.log($user);

				newUser.email = '';
				newUser.password = '';
			}
		} catch (error) {
			console.error('Error login:', error);
			// toast.error('Fejl ved login:', error.message);
		}
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
			{#if $user.email}
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
						href={$user.email ? '/users' : '/'}>Kontoransatte</a
					>
					<a
						class="nav-link"
						class:active={$page.url.pathname === '/afdelinger'}
						data-sveltekit-preload-data
						href={$user.email ? '/location' : '/'}>Afdelinger</a
					>
				</div>
			{/if}

			{#if !$user.email}
				<form on:submit|preventDefault={login} class="d-flex ms-auto">
					<input
						class="form-control me-2"
						type="text"
						placeholder="Email"
						aria-label="Email"
						bind:value={newUser.email}
					/>
					<input
						class="form-control me-2"
						type="password"
						placeholder="Password"
						aria-label="Password"
						bind:value={newUser.password}
					/>
					<button class="btn btn-outline-success" type="submit">Login</button>
				</form>
			{:else}
				<button class="btn btn-outline-success d-flex ms-auto" on:click={logout}>Logud</button>
			{/if}
		</div>
	</div>
</nav>

<main class="container">
	{#if $user.email}
		<slot />
		<!-- {:else}
		<div>Du har ikke adgang her</div> -->
	{/if}
</main>

<style>
	.nav-container {
		display: flex;
		flex-direction: row;
		align-items: space-between;
	}
</style>
