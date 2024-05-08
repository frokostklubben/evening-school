<script>
	import ModalDelete from './ModalDelete.svelte';
	import ModalEdit from './ModalEdit.svelte';
	import { headerKeys, headerKeysDanish, itemList } from '../stores/itemListStore.js';
	import { selectedItem, showDeleteModal, showEditModal } from '../stores/modalStore.js';
	import { displayNames } from '../stores/dictionaryStore.js';
	import { goto } from '$app/navigation';
	import { user } from '../stores/userStore.js';

	export let collection;
	export let idKey;

	headerKeysDanish.set(
		$itemList.length > 0
			? Object.keys($itemList[0])
					.filter((key) => !key.endsWith('_id'))
					.map((key) => displayNames[key] || key)
			: []
	);

	headerKeys.set(
		$itemList.length > 0 ? Object.keys($itemList[0]).filter((key) => !key.endsWith('_id')) : []
	);
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
										<td>{listItem[key]}</td>
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
									<!-- {#if $user.roleId === 1} -->
									<td
										><button
											class="btn"
											on:click={() => {
												selectedItem.set(listItem);
												goto('/courses');
											}}>Se hold</button
										></td
									>
									<!-- {/if} -->
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
