<script>
	import ModalDelete from './ModalDelete.svelte';
	import ModalEdit from './ModalEdit.svelte';
	import { headerKeys, headerKeysDanish, itemList } from '../stores/itemListStore.js';
	import { optionId, selectedItem, showDeleteModal, showEditModal } from '../stores/modalStore.js';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { titleStore } from '../stores/titleStore.js';
	import { selectionsLoading, secondSelectionsLoading } from '../stores/generalStore';
	import Spinner from './Spinner.svelte';
	import { getKeys } from '../utils/headerkeys';

	export let collection;
	export let idKey;
	export let buttons = [];
	export let showButtons = false;
	export let showEditButton = false;
	export let showDeleteButton = false;

	onMount(() => {
		getKeys(collection);
	});

	function formatInventory(inventories) {
		if (!inventories) return '';
		return Array.isArray(inventories) ? inventories.join(', ') : inventories;
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
									<th class="pr-6">{key}</th>
								{/each}
							</tr>
						</thead>
						<tbody>
							{#each $itemList as listItem, index}
								<tr class="hover-row">
									{#each $headerKeys as key (key)}
										<td>
											{#if key === 'inventories'}
												<!-- || key === 'inventory' || key === 'item_list' || key === 'Inventories' -->
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
														titleStore.set(listItem[button.store]);
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
			{:else if $optionId != 'empty'}
				{#if $itemList.length == 0 && !$selectionsLoading && !$secondSelectionsLoading}
					<div class="alert alert-warning" role="alert">Ingen data</div>
				{:else}
					<Spinner />
				{/if}
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
