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

	let isLoading = true;

	onMount(async () => {

		if (localStorage.getItem('sid')) {
			try {
				const sid = localStorage.getItem('sid');
				const response = await fetch(`${$AUTH_URL}/auth/validateSession`, {
					method: 'POST',
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ sid })
				});

				if (response.ok) {
					const result = await response.json();
					user.set(result.data);
					goto('/'); // Should navigate back to the previous page
				} else {
					localStorage.removeItem('sid');
				}
			} catch (error) {
				console.error(error);
			} finally {
				isLoading = false;
			}
		} else {
			isLoading = false;
		}
	});

	let newUser = {
		email: 'admin@jensen.dk',
		password: '1'
	};

	function toggleOpen() {
		isOpen = !isOpen;
	}

	async function logout() {
		user.set({});

		try {
			const response = await fetch(`${$AUTH_URL}/auth/logout`, {
				credentials: 'include'
			});

			if (response.ok) {
				goto('/');
			} else {
				toast.error('Fejl ved logud, kontakt admin');
			}
		} catch (error) {
			console.error(error.message);
		}
	}

	// TODO: move to utils later
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
				goto('/');
			}
		} catch (error) {
			console.error('Error login:', error);
			// toast.error('Fejl ved login:', error.message);
		}
	}
</script>

{#if !isLoading}
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
					<a
						class="nav-link"
						class:active={$page.url.pathname === '/afdelinger'}
						data-sveltekit-preload-data
						href="/location">Afdelinger</a
					>
				</div>

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
		<!-- TODO: conditional logik her -->
		<slot />
	</main>
{:else}
	<!-- Show spinner while loading -->
	<div
		class="d-flex justify-content-center align-items-center"
		style="position: fixed; top: 0; right: 0; bottom: 0; left: 0; background-color: rgba(255, 255, 255, 0.5);"
	>
		<div class="spinner-border text-primary" role="status"></div>
	</div>
{/if}

<style>
	.nav-container {
		display: flex;
		flex-direction: row;
		align-items: space-between;
	}
</style>
