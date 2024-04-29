<script>
	import SelectBoxOptions from './SelectBoxOptions.svelte';
    import { Button, Modal } from 'flowbite-svelte';
	import { toast, Toaster } from 'svelte-french-toast';

    let showEditModal = false;
	let showDeleteConfirmModal = false;
    let selectedUser = writable({});
	import { writable } from 'svelte/store';


	export let list;
	export let listName;
	export let idKey;

	let headerKeys =
		list.length > 0 ? Object.keys(list[0]).filter((key) => !key.endsWith('_id')) : [];
</script>

<div class="container mt-5">
	<div class="row justify-content-center">
		<div class="col-12 col-md-8 col-lg-6">
			<h2 class="mb-4">{listName}</h2>
			{#if list.length > 0}
				<div class="list-group">
					<table>
						<thead>
							<tr>
								{#each headerKeys as key (key)}
									<th>{key}</th>
								{/each}
							</tr>
						</thead>
						<tbody>
							{#each list as listItem, index (listItem[idKey])}
								<tr>
									{#each headerKeys as key (key)}
										<td>{listItem[key]}</td>
									{/each}
									<td>
										<button class="btn" on:click={() => openEditModal(user)}>
											<i class="bi bi-pencil-square"></i>
										</button></td
									>
									<td
										><button class="btn" on:click={() => openDeleteConfirmModal(user)}>
											<i class="bi bi-trash-fill"></i>
										</button></td
									>
								</tr>
							{/each}
						</tbody>
					</table>

					<!--
							<div class="list-group-item d-flex justify-content-between align-items-center">
								{listItem.first_name}
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
                            -->
					<!--{/each}-->
				</div>
			{:else}
				<div class="alert alert-warning" role="alert">Ingen data</div>
			{/if}
		</div>
	</div>
</div>


<!-- MODALS -->
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