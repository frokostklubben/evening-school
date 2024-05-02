<script>
	//@ts-nocheck
	import { onMount } from 'svelte';
	import ListItems from './ListItems.svelte';
	import SelectBoxOptions from './SelectBoxOptions.svelte';
	import { itemList } from '../stores/itemListStore';
	import { selectedSchoolId } from '../stores/modalStore';

	let options = [];
	let hasSelected = false;

	export let listIdKey;
	export let listCollection;
	export let optionsCollection;
	export let label;

	onMount(() => {
		itemList.set([]);
		fetchOptions();
	});

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
		selectedSchoolId.set(event.target.value);
		console.log('school_id:', $selectedSchoolId);
		hasSelected = false;
	}

	async function fetchResultOnOption(optionId) {
		if (optionId) {
			const response = await fetch(`http://localhost:8080/api/${listCollection}/${optionId}`);
			if (response.ok) {
				const result = await response.json();
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
	}
</style>
