<script>
	import ModalDelete from './ModalDelete.svelte';
	import ModalEdit from './ModalEdit.svelte';
	import { derived } from 'svelte/store';
	import { headerKeys, headerKeysDanish, itemList } from '../stores/itemListStore.js';
	import { optionId, selectedItem, showDeleteModal, showEditModal } from '../stores/modalStore.js';
	import { displayNames } from '../stores/dictionaryStore.js';
	import { goto } from '$app/navigation';
	import { user } from '../stores/userStore';
	import { BASE_URL } from '../stores/apiConfig.js';
	import { onMount } from 'svelte';
	import { buttonStoreValue } from '../stores/buttonStore.js';

	export let collection;
	export let idKey;
	export let buttons = [];
	export let showButtons = false;
	export let showEditButton = false;
	export let showDeleteButton = false;

	// Derived function made with chatgpt! (Marcus)
	// Her defineres en "afledt store" derivedHeaderKeys. Den afhænger af itemList og udfører en funktion, hver gang itemList ændrer sig. Funktionen tager itemList som argument og returnerer en array af nøglerne (keys) af det første element i itemList, hvis itemList ikke er tom. Hvis itemList er tom, returnerer funktionen en tom array.

	// The derived store ensures that whenever itemList changes, the headerKeys are recalculated and updated automatically

	const derivedHeaderKeys = derived(itemList, ($itemList) => {
		if ($itemList.length > 0) {
			return Object.keys($itemList[0]);
		}
		return [];
	});

	derivedHeaderKeys.subscribe((keys) => {
		if (keys.length > 0) {
			setHeaderKeys(keys);
		}
	});

	onMount(() => {
		fetchHeaderKeys();
	});

	function setHeaderKeys(data) {
		const excludeKeys = ['_id', 'hashed_password'];

		// 	Made in cooperation with chatgpt (Marcus)
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
		} else {
			console.error('Failed to fetch header keys from the server');
		}
	}

	function formatInventory(inventory) {
		return Array.isArray(inventory) ? inventory.join(', ') : inventory;
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
										<td>
											{#if key === 'inventories'}
												{formatInventory(listItem[key])}
											{:else if key === 'start_date' || key === 'end_date'}
												{new Date(formatInventory(listItem[key])).toLocaleDateString()}
											{:else}
												{listItem[key]}
											{/if}
										</td>
									{/each}
									{#if showEditButton}
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
											</button>
										</td>
									{/if}
									{#if showDeleteButton}
										<td>
											<button
												class="btn"
												on:click={() => {
													selectedItem.set(listItem);
													showDeleteModal.set(true);
												}}
												title="Slet"
											>
												<i class="bi bi-trash-fill"></i>
											</button>
										</td>
									{/if}
									{#if showButtons}
										{#each buttons as button}
											<td>
												<button
													class="btn"
													on:click={() => {
														selectedItem.set(listItem);
														optionId.set(listItem[button.key]);
														console.log('optionId:', optionId);
														buttonStoreValue.set(listItem[button.store]);

														goto(button.url);
													}}
												>
													{button.text}
												</button>
											</td>
										{/each}
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
