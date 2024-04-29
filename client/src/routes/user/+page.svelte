<script lang="ts">
	import { goto } from '$app/navigation';
	import type { School } from '$lib/types';
	import { onMount } from 'svelte';
	import { toast, Toaster } from 'svelte-french-toast';

	let user = {
		first_name: '',
		last_name: '',
		email: '',
		school_id: '',
		role_id: ''
	};

	let schools: School[] = [];

	onMount(() => {
		fetchSchools();
	});

	async function fetchSchools() {
		const response = await fetch('http://localhost:8080/api/schools');
		const result = await response.json();

		if (response.ok) {
			schools = result.data;
		} else {
			console.error('Failed to fetch schools');
			toast.error(result.message);
		}
	}

	async function addUser(event: SubmitEvent) {
		const response = await fetch('http://localhost:8080/api/users', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(user)
		});

		const result = await response.json();

		if (response.ok) {
			toast.success(result.message);
			console.log(result.message);
		} else {
			console.error('Failed to create user');
			console.log(result.message);
			toast.error(result.message);
		}
	}
</script>

<div class="container mt-5">
	<div class="row justify-content-center">
		<div class="col-md-6">
			<h2 class="text-center mb-4">Ny bruger</h2>

			<form on:submit|preventDefault={addUser} class="needs-validation" novalidate>
				<div class="mb-3">
					<label for="first_name" class="form-label">Fornavn</label>
					<input
						type="text"
						class="form-control"
						id="first_name"
						bind:value={user.first_name}
						required
					/>
				</div>
				<div class="mb-3">
					<label for="last_name" class="form-label">Efternavn</label>
					<input
						type="text"
						class="form-control"
						id="last_name"
						bind:value={user.last_name}
						required
					/>
				</div>
				<div class="mb-3">
					<label for="email" class="form-label">Email</label>
					<input type="email" class="form-control" id="email" bind:value={user.email} required />
				</div>
				<div class="mb-3">
					<!-- <label for="school_id" class="form-label">Vælg skole at tilknytte</label> -->
					<select class="form-control" id="school_id" bind:value={user.school_id}>
						<option value="">Vælg en skole</option>
						{#each schools as school}
							<option value={school.school_id}>{school.name}</option>
						{/each}
					</select>
				</div>
				<button type="submit" class="btn btn-primary">Create User</button>
			</form>
		</div>
	</div>
</div>

<Toaster />

<svelte:head>
	<title>Add a user</title>
</svelte:head>
