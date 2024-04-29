<script lang="ts">
	import { onMount } from 'svelte';
	import type { School, User } from '$lib/types';
	import { writable } from 'svelte/store';
	import { Button, Modal } from 'flowbite-svelte';
	import { toast, Toaster } from 'svelte-french-toast';
	import ListItems from '../../components/ListItems.svelte'

	let schools: School[] = [];
	let users: User[] = [];
	let selectedSchoolId = '';
	let hasSelected: boolean = false;
	let selectedUser = writable({} as User);
	let showEditModal = false;
	let showDeleteConfirmModal = false;

	let editableUser = {
		user_id: $selectedUser.user_id,
		first_name: '',
		last_name: '',
		email: ''
	};

	onMount(() => {
		fetchSchools();
	});

	function refreshUsers() {
		fetchUsersForSchool(selectedSchoolId);
	}

	async function fetchSchools() {
		const response = await fetch('http://localhost:8080/api/schools');
		if (response.ok) {
			const result = await response.json();
			schools = result.data;
		} else {
			console.error('Failed to fetch schools');
		}
	}

	async function fetchUsersForSchool(schoolId: string) {
		if (schoolId) {
			const response = await fetch(`http://localhost:8080/api/users/${schoolId}`);
			if (response.ok) {
				const result = await response.json();
				users = result.data;
				hasSelected = true;
			} else {
				console.error('Failed to fetch users for school');
			}
		}
	}

	function onSchoolChange(event: Event) {
		const select = event.target as HTMLSelectElement;
		selectedSchoolId = select.value;
		fetchUsersForSchool(selectedSchoolId);
		hasSelected = false;
	}

	function openEditModal(user: User) {
		selectedUser.set(user);
		editableUser = { ...user };
		showEditModal = true;
	}

	function openDeleteConfirmModal(user: User) {
		selectedUser.set(user);
		showDeleteConfirmModal = true;
	}

	async function updateUser() {
		editableUser = { ...$selectedUser };

		console.log(editableUser);

		try {
			const response = await fetch(`http://localhost:8080/api/users/${$selectedUser.user_id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(editableUser)
			});

			if (response.ok) {
				refreshUsers();
			}
			if (!response.ok) throw new Error('Failed to update user');
			const result = await response.json();
			console.log('Update Successful:', result);
			// toast.success('Bruger er opdateret i systemet', {
			// 	duration: 3000
			// });
			return result;
		} catch (error) {
			console.error('Error updating user:', error);
			// toast.error('Fejl ved opdatering', {
			// 	duration: 3000
			// });
		}
	}

	async function deleteUser() {
		try {
			const response = await fetch(`http://localhost:8080/api/users/${$selectedUser.user_id}`, {
				method: 'DELETE'
			});
			if (!response.ok) throw new Error('Failed to delete user');
			console.log('Delete Successful');
			toast.success('Bruger slettet');
			return 'Deleted Successfully';
		} catch (error) {
			console.error('Error deleting user:', error);
		}
	}
</script>

<!-- Modal for edit user -->
<Modal title="Redigere bruger" bind:open={showEditModal} autoclose>
	<div class="container-fluid mt-5">
		<div class="row justify-content-center">
			<div class="col-md-6">
				<form on:submit|preventDefault={updateUser} class="needs-validation" novalidate>
					<div class="mb-3">
						<label for="first_name" class="form-label">Fornavn</label>

						<input
							type="text"
							class="form-control"
							id="first_name"
							bind:value={$selectedUser.first_name}
							required
						/>
					</div>
					<div class="mb-3">
						<label for="last_name" class="form-label">Efternavn</label>
						<input
							type="text"
							class="form-control"
							id="last_name"
							bind:value={$selectedUser.last_name}
							required
						/>
					</div>
					<div class="mb-3">
						<label for="email" class="form-label">Email</label>
						<input
							type="email"
							class="form-control"
							id="email"
							bind:value={$selectedUser.email}
							required
						/>
					</div>
					<div class="mb-3">
						<select class="form-control" id="school_id" bind:value={$selectedUser.school_id}>
							<option value="">Vælg en skole</option>
							{#each schools as school}
								<option value={school.school_id}>{school.name}</option>
							{/each}
						</select>
					</div>
				</form>
			</div>
		</div>
	</div>

	<svelte:fragment slot="footer">
		<div class="container">
			<div class="text-center">
				<Button type="submit" color="green" on:click={updateUser}>Gem</Button>
				<Button color="red">Afbryd</Button>
			</div>
		</div>
	</svelte:fragment>

	<Toaster />
</Modal>

<!-- Modal for delete user -->
<Modal bind:open={showDeleteConfirmModal} size="xs" autoclose>
	<div class="text-center">
		<h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
			Er du sikker på at du vil slette {$selectedUser.first_name}
			{$selectedUser.last_name}?
		</h3>
		<Button color="red" class="me-2" on:click={deleteUser}>Ja, slet</Button>
		<Button color="alternative">Afbryd</Button>
	</div>
</Modal>

<div class="mb-3">
	<label for="school-select" class="form-label">Vælg en skole</label>
	<select id="school-select" class="form-select" on:change={onSchoolChange}>
		<option value="">Vælg en skole</option>
		{#each schools as school}
			<option value={school.school_id}>{school.name}</option>
		{/each}
	</select>
</div>

<ListItems list={users} listName={"Users"}/>


<!--
<div class="container mt-5">
	<div class="row justify-content-center">
		<div class="col-12 col-md-8 col-lg-6">
			<h2 class="mb-4">Se alle kontoransatte ved valgte skole</h2>
			<div class="mb-3">
				<label for="school-select" class="form-label">Vælg en skole</label>
				<select id="school-select" class="form-select" on:change={onSchoolChange}>
					<option value="">Vælg en skole</option>
					{#each schools as school}
						<option value={school.school_id}>{school.name}</option>
					{/each}
				</select>
			</div>
			{#if hasSelected}
				{#if users.length > 0}
					<div class="list-group">
						{#each users as user}
							<div class="list-group-item d-flex justify-content-between align-items-center">
								{user.first_name}
								{user.last_name} <span>{user.email}</span>
								<span>
									<button class="btn" on:click={() => openEditModal(user)}>
										<i class="bi bi-pencil-square"></i>
									</button>
									<button class="btn" on:click={() => openDeleteConfirmModal(user)}>
										<i class="bi bi-trash-fill"></i>
									</button>
								</span>
							</div>
						{/each}
					</div>
				{:else}
					<div class="alert alert-warning" role="alert">
						Ingen brugere fundet for den valgte skole.
					</div>
				{/if}
			{/if}
		</div>
	</div>
</div>
-->

