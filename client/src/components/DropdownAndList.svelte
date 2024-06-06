<script>
	import { onMount } from 'svelte';
	import ListItems from './ListItems.svelte';
	import SelectBoxOptions from './SelectBoxOptions.svelte';
	import { headerKeysDanish, itemList, headerKeys } from '../stores/itemListStore';
	import { optionId, showAddModal } from '../stores/modalStore';
	import ModalAdd from '../components/ModalAdd.svelte';
	import { Button } from 'flowbite-svelte';
	import { BASE_URL } from '../stores/apiConfig.js';
	import { selectionsLoading, contentLoading } from '../stores/generalStore';
	import Spinner from './Spinner.svelte';

	export let listIdKey; // f.eks. user_id, hvis resultatet er users
	export let listCollection;
	export let optionsCollection;
	export let optionsIdKey;
	export let label;
	export let modalTitle;
	export let optionName;
	export let showButtons;
	export let showEditButton;
	export let showDeleteButton;
	export let buttons = [];

	let options = [];
	let hasSelected = false;
	headerKeysDanish.set([]);
	headerKeys.set([]);

	itemList.set([]);

	onMount(() => {
		selectionsLoading.set(true);
		$optionId = 'empty';
		fetchOptions();
	});

	function addItem() {
		showAddModal.set(true);
	}
	async function fetchOptions() {
		const response = await fetch(`${$BASE_URL}/${optionsCollection}`, {
			credentials: 'include'
		});

		if (response.ok) {
			const result = await response.json();
			options = result.data;
			selectionsLoading.set(false);
		} else {
			console.error(`Failed to fetch ${optionsCollection}`);
		}
	}

	function handleOptionChange(event) {
		contentLoading.set(true);
		fetchResultOnOption(event.target.value);
		optionId.set(event.target.value);
		hasSelected = false;
	}

	async function fetchResultOnOption(optionId) {
		if (optionId) {
			const response = await fetch(`http://localhost:8080/api/${listCollection}/${optionId}`, {
				credentials: 'include'
			});

			if (response.ok) {
				const result = await response.json();
				itemList.set(result.data);
				hasSelected = true;
				contentLoading.set(false);

			} else {
				console.error(`Failed to fetch ${listCollection} on ${optionsCollection}`);
			}
		}

	}

	import './dropdownAndList.css';
</script>

<div id="options-container">
	{#if !$selectionsLoading}
		<div id="button-and-dropdown">
			<SelectBoxOptions
				{label}
				selected={'empty'}
				idKey={optionsIdKey}
				{optionName}
				{options}
				onOptionChange={handleOptionChange}
			/>
			{#if $optionId != 'empty' && !$contentLoading && hasSelected}
				<div class="text-center">
					<Button style="margin-top: 6px;" type="submit" color="green" on:click={addItem}
						>{modalTitle}</Button
					>
				</div>
			{/if}
		</div>
		{#if !$contentLoading}
			<ListItems
				idKey={listIdKey}
				collection={listCollection}
				{showButtons}
				{buttons}
				{showEditButton}
				{showDeleteButton}
			/>
		{:else}
			<Spinner />
		{/if}
	{/if}
	{#if $selectionsLoading}
		<Spinner />
	{/if}

</div>

{#if showAddModal}
	<ModalAdd collection={listCollection} idKey={optionsIdKey} {modalTitle} />
{/if}

<style>
	#options-container {
		display: flex;
		flex-direction: column;
		justify-content: baseline;
		align-items: center;
		margin-top: 3rem;
	}

	#button-and-dropdown {
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		gap: 15px;
	}
</style>
