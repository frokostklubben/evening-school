<script>
	import ModalDelete from './ModalDelete.svelte';
	import ModalEdit from './ModalEdit.svelte';
	import { headerKeys, headerKeysDanish, itemList } from '../stores/itemListStore.js';
	import { selectedItem, showDeleteModal, showEditModal } from '../stores/modalStore.js';
	import { displayNames } from '../stores/dictionaryStore.js';
	import { goto } from '$app/navigation';
	import { user } from '../stores/userStore';
	import { BASE_URL } from '../stores/apiConfig.js';
	import { onMount } from 'svelte';

	export let collection;
	export let idKey;
	export let showCoursesButton = false;

	onMount(() => {
		fetchHeaderKeys();
	});

	function setHeaderKeys(data) {
		const excludeKeys = ['_id', 'hashed_password'];

		// Made in cooperation with chatgpt (Marcus)
		const filteredKeys = data.filter(
			(key) => !excludeKeys.some((excludeKey) => key.endsWith(excludeKey) || key === excludeKey)
		);
		headerKeys.set(filteredKeys);
		headerKeysDanish.set(filteredKeys.map((key) => displayNames[key] || key));
	}

	async function fetchHeaderKeys() {
		const response = await fetch(`${$BASE_URL}/headerKey/${collection}`, {
			credentials: 'include'
		});

		if (response.ok) {
			const result = await response.json();
			setHeaderKeys(result.data);

			// headerKeysDanish.set(result.data.map((key) => displayNames[key] || key));
		} else {
			console.error('Failed to fetch header keys from the server');
		}
	}




</script>

<div class="container mt-5">
	<div class="row justify-content-center">
		<div class="col-12 col-lg-10">
			{#if $itemList.length > 0}
				<div class="list-group">
					<table class="w-100">
						<thead>
							<tr>
								{#each $headerKeysDanish as key (key)}
									<th>{$displayNames[key]}</th>
								{/each}
							</tr>
						</thead>
						<tbody>
							{#each $itemList as listItem, index}
								<tr class="hover-row">
									{#each $headerKeys as key (key)}
										{#if key === 'start_date' || key === 'end_date'}
											<td>{new Date(listItem[key]).toLocaleDateString()}</td>
										{:else}
											<td>{listItem[key]}</td>
										{/if}
									{/each}
									<td>
										<button
											class="btn"
											on:click={() => {
												selectedItem.set(listItem);
												showEditModal.set(true);
											}}
											title="Rediger"
										>
											<i class="bi bi-pencil-square"></i>
										</button></td
									>
									<td
										><button
											class="btn"
											on:click={() => {
												selectedItem.set(listItem);
												showDeleteModal.set(true);
											}}
											title="Slet"
										>
											<i class="bi bi-trash-fill"></i>
										</button></td
									>
									{#if showCoursesButton}
										<td
											><button
												class="btn"
												on:click={() => {
													selectedItem.set(listItem);
													goto('/courses');
												}}>Se hold</button
											></td
										>
									{/if}
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<div class="alert alert-warning" role="alert">Ingen data</div>
			{/if}
		</div>
	</div>
</div>

<ModalEdit {collection} {idKey} />

<ModalDelete {collection} {idKey} />

<style>
	.hover-row:hover {
		background-color: #e0e0e0;
	}
</style>
