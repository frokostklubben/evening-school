<script>
	//@ts-nocheck
	import { onMount } from 'svelte';
	import ListItems from './ListItems.svelte';
	import SelectBoxOptions from './SelectBoxOptions.svelte';
	import { headerKeys, itemList } from '../stores/itemListStore';
	import { optionId, showAddModal } from '../stores/modalStore';
	import ModalAdd from '../components/ModalAdd.svelte';
	import { Button } from 'flowbite-svelte';

	export let listIdKey; // f.eks. user_id, hvis resultatet er users
	export let listCollection;
	export let optionsCollection;
	export let optionsIdKey
	export let label;
	export let modalTitle

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
		const response = await fetch(`http://localhost:8080/api/${optionsCollection}`);

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
			const response = await fetch(`http://localhost:8080/api/${listCollection}/${optionId}`);

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
	<SelectBoxOptions {label} selected={''} {options} onOptionChange={handleOptionChange} />

	{#if $optionId}
		<div class="text-center mt-10 mb-10">
			<Button type="submit" color="green" on:click={addItem}>Ny {modalTitle}</Button>
		</div>
	{/if}

	{#if showAddModal}
	<ModalAdd collection={listCollection} title={label} idKey={optionsIdKey} {modalTitle} />
	{/if}

	{#if $itemList.length > 0}
		<ListItems idKey={listIdKey} collection={listCollection} />
	{:else if hasSelected}
		<div>Ingen brugere fundet</div>
	{/if}
</div>

<style>
	#options-container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		margin-top: 3rem;
	}
</style>
