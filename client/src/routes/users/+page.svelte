<script>
	// @ts-nocheck
	import DropdownAndList from '../../components/DropdownAndList.svelte';
	import { displayNames } from '../../stores/dictionaryStore.js';
	import ModalAdd from '../../components/ModalAdd.svelte';
	import { Button } from 'flowbite-svelte';
	import { showAddModal, optionId, selectedItem } from '../../stores/modalStore.js';
	import { onMount } from 'svelte';
	import { onMount } from 'svelte';

	let title = 'kontoransat';

	let fields = [
		{ name: 'first_name', label: 'Fornavn', type: 'text', required: true },
		{ name: 'last_name', label: 'Efternavn', type: 'text', required: true },
		{ name: 'email', label: 'Email', type: 'email', required: true }
	];

	onMount(() => {
		$optionId = '';
	});

	function addUser() {
		showAddModal.set(true);
	}

	displayNames.set({
		first_name: 'Fornavn',
		last_name: 'Efternavn',
		email: 'Email'
	});

</script>


 {#if $optionId}
	<div class="text-center mt-10 mb-10">
		<Button type="submit" color="green" on:click={addUser}>Ny kontoransat</Button>
	</div>
{/if}


 <DropdownAndList
	listIdKey={'user_id'}
	listCollection={'users'}
	optionsCollection={'schools'}
	label={'Aftenskole'}
/>  

{#if showAddModal}
	<ModalAdd collection={'users'} idKey={'school_id'} {fields} {title} />
{/if}




<!-- <script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import { toast, Toaster } from 'svelte-french-toast';

	let user = {
		first_name: '',
		last_name: '',
		email: '',
		school_id: '',
		role_id: ''
	};

	let schools = [];

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

	async function addUser() {
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
			toast.error(result.message);
		}
	}
</script>

<div class="container mt-5">
	<div class="row justify-content-center">
		<div class="col-md-6">
			<h2 class="text-center mb-4">Ny bruger</h2>

			<form on:submit|preventDefault={addUser} class="needs-validation">
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
</svelte:head> -->
