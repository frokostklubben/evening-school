<script>
	import { onMount } from 'svelte';
	import ListItems from './ListItems.svelte';
	import SelectBoxOptions from './SelectBoxOptions.svelte';
	import { headerKeys, itemList } from '../stores/itemListStore';
	import { optionId, showAddModal } from '../stores/modalStore';
	import ModalAdd from '../components/ModalAdd.svelte';
	import { Button } from 'flowbite-svelte';
	import { BASE_URL } from '../stores/apiConfig.js';

	export let listIdKey; // f.eks. user_id, hvis resultatet er users
	export let listCollection;
	export let optionsCollection;
	export let optionsIdKey;
	export let label;
	export let modalTitle;
	export let optionName;

	let options = [];
	let hasSelected = false;

	onMount(() => {
		$optionId = '';
		itemList.set([]);
		fetchOptions();
	});

	function addItem() {
		showAddModal.set(true);
	}

	async function fetchOptions() {
		const response = await fetch(`${$BASE_URL}/${optionsCollection}`, {
			credentials: 'include',
		});

		if (response.ok) {
			const result = await response.json();

			options = result.data;
		} else {
			console.error(`Failed to fetch ${optionsCollection}`);
		}
	}

	function handleOptionChange(event) {
		fetchResultOnOption(event.target.value);
		optionId.set(event.target.value);
		hasSelected = false;
	}

	async function fetchResultOnOption(optionId) {
		if (optionId) {
			const response = await fetch(`http://localhost:8080/api/${listCollection}/${optionId}`, {
				credentials: 'include',
			});

			if (response.ok) {
				const result = await response.json();

				//Her skal der ske noget med headerkeys, hvis listen er tom
				let list = result.data;
				itemList.set(result.data);
				hasSelected = true;
			} else {
				console.error(`Failed to fetch ${listCollection} on ${optionsCollection}`);
			}
		}
	}

	import './dropdownAndList.css';
</script>

<div id="options-container">
	<div id="button-and-dropdown">
		<SelectBoxOptions {label} selected={''} idKey={optionsIdKey} {optionName} {options} onOptionChange={handleOptionChange} />
		{#if $optionId}
			<div class="text-center">
				<Button style="margin-top: 6px;" type="submit" color="green" on:click={addItem}
					>Ny {modalTitle}</Button
				>
			</div>
		{/if}
	</div>

	{#if $itemList.length > 0}
		<ListItems idKey={listIdKey} collection={listCollection} />
	{:else if hasSelected}
		<div>Ingen brugere fundet</div>
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
