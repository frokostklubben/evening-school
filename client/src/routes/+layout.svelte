<script>
	import 'bootstrap/dist/css/bootstrap.css';
	import { page } from '$app/stores';
	import { user, newUser } from '../stores/userStore.js';
	import { onMount } from 'svelte';
	import { login, logout, validateSession } from '../utils/auth.js';
	import { isLoading, loginLoading } from '../stores/generalStore.js';
	import { Toaster } from 'svelte-french-toast';

	let isOpen = false;
	$: testUser = $newUser;
	$: loginLoadingSpinner = $loginLoading;

	onMount(async () => {
		validateSession();
	});

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
		{#if !$isLoading}
		<div class:show={isOpen} class="collapse navbar-collapse" id="navbarNavAltMarkup">

			<div class="navbar-nav">
				
				<!-- navbar showing for admin -->
				{#if $user.roleId === 1}
			
					<a
						class="nav-link"
						class:active={$page.url.pathname === '/classrooms/admin'}
						data-sveltekit-preload-data
						href={$user.roleId === 1 ? '/classrooms/admin' : '/'}>Lokaler</a
					>

					<a
						class="nav-link"
						class:active={$page.url.pathname === '/users/admin'}
						data-sveltekit-preload-data
						href={$user.email ? '/users/admin' : '/'}>Kontoransatte</a
					>

					<a
						class="nav-link"
						class:active={$page.url.pathname === '/location/admin'}
						data-sveltekit-preload-data
						href={$user.email ? '/location/admin' : '/'}>Afdelinger</a
					>

					<!-- navbar showing for office employees -->
				{:else if $user.roleId === 2}
					<a
						class="nav-link"
						class:active={$page.url.pathname === '/booking'}
						data-sveltekit-preload-data
						href="/booking">Booking</a
					>
					<a
						class="nav-link"
						class:active={$page.url.pathname === '/edit-booking'}
						data-sveltekit-preload-data
						href="/edit-booking">Rediger booking</a
					>

					<a
						class="nav-link"
						class:active={$page.url.pathname === '/location/user'}
						data-sveltekit-preload-data
						href={$user.email ? '/location/user' : '/'}>Afdelinger</a
					>
					<a
						class="nav-link"
						class:active={$page.url.pathname === '/room-search'}
						data-sveltekit-preload-data
						href={$user.email ? '/room-search' : '/'}>Find ledige lokaler</a
					>
					<a
						class="nav-link"
						class:active={$page.url.pathname === '/users/user'}
						data-sveltekit-preload-data
						href={$user.email ? '/users/user' : '/'}>Medarbejdere</a
					>
					<a
						class="nav-link"
						class:active={$page.url.pathname === '/holiday'}
						data-sveltekit-preload-data
						href="/holiday">Helligdage</a
					>
				{/if}
			</div>
			{#if !loginLoadingSpinner}
				{#if !$user.email}
					<form on:submit|preventDefault={login} class="d-flex ms-auto">
						<input
							class="form-control me-2"
							type="text"
							placeholder="Email"
							aria-label="Email"
							bind:value={testUser.email}
						/>
						<input
							class="form-control me-2"
							type="password"
							placeholder="Password"
							aria-label="Password"
							bind:value={testUser.password}
						/>
						<button class="btn btn-outline-success" type="submit">Log&nbspind</button>
					</form>
				{:else}
					<button class="btn btn-outline-success d-flex ms-auto" on:click={logout}>Log&nbspud</button>
				{/if}
			{:else}
				<!-- Show spinner while loading -->
				<div class="d-flex ms-auto">
					<div class="spinner-border text-primary" role="status"></div>
				</div>
			{/if}

			</div>
		{/if}
			</div>
</nav>

{#if $user.email}
	<main class="container">
		{#if !$isLoading}
			<slot />
			<Toaster />
		{:else}
			<!-- Show spinner while loading -->
			<div
				class="d-flex justify-content-center align-items-center"
				style="position: fixed; top: 0; right: 0; bottom: 0; left: 0; background-color: rgba(255, 255, 255, 0.5);"
			>
				<div class="spinner-border text-primary" role="status"></div>
			</div>
		{/if}
	</main>
{/if}

<style>
	.navbar {
		z-index: 1000;
	}
	.nav-link.active {
		font-weight: bold;
		color: #000408 !important;
	}
</style>
