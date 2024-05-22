<script>
	import { onMount } from 'svelte';
	import ListItems from '../../../components/ListItems.svelte';
	import SelectBoxOptions from '../../../components/SelectBoxOptions.svelte';
	import { itemList } from '../../../stores/itemListStore';
	import { optionId, showAddModal } from '../../../stores/modalStore';
	import ModalAdd from '../../../components/ModalAdd.svelte';
	import { Button } from 'flowbite-svelte';
	import { BASE_URL } from '../../../stores/apiConfig.js';
	import { displayNames } from '../../../stores/dictionaryStore.js';
	import { headerKeys } from '../../../stores/itemListStore.js';

	let listIdKey; // f.eks. user_id, hvis resultatet er users
	let listCollection;
	let optionsCollection;
	let optionsIdKey;
	let label;
	let modalTitle = 'Nyt lokale';
	let optionName;
	let showButtons;
	let showEditButton;
	let showDeleteButton;
	let buttons = [];
	let locations = [];

	let options = [];
	$: selectedSchool = '';
	let hasSelected = false;

	displayNames.set({
		room_name: 'Lokale',
		purpose: 'Formål',
		inventories: 'Inventar',
		capacity: 'Kapacitet'
	});

	onMount(() => {
		$optionId = '';
		itemList.set([]);
		fetchSchools();
	});

	async function fetchSchools() {
		const response = await fetch(`${$BASE_URL}/schools`, {
			credentials: 'include'
		});

		if (response.ok) {
			const result = await response.json();
			options = result.data;
		} else {
			console.error(`Failed to fetch schools`);
		}
	}

	async function fetchClassrooms() {
		const response = await fetch(`${$BASE_URL}/classrooms/${$optionId}`, {
			credentials: 'include'
		});

		if (response.ok) {
			const result = await response.json();
			itemList.set(result.data);
		} else {
			console.error(`Failed to fetch classrooms: ${response.status} ${response.statusText}`);
		}
	}

	function handleSchoolChange(event) {
		selectedSchool = Number(event.target.value);
		fetchLocations();
	}

	async function fetchLocations() {
		const response = await fetch(`${$BASE_URL}/locations/${selectedSchool}`, {
			credentials: 'include'
		});

		if (response.ok) {
			const result = await response.json();
			locations = result.data;
		} else {
			console.error(`Failed to fetch locations`);
		}
	}

	function addItem() {
		showAddModal.set(true);
	}

	/* async function fetchOptions() {
		const response = await fetch(`${$BASE_URL}/${optionsCollection}`, {
			credentials: 'include'
		});

		if (response.ok) {
			const result = await response.json();
			options = result.data;
		} else {
			console.error(`Failed to fetch ${optionsCollection}`);
		}
	}
 */
	function handleOptionChange(event) {
		//fetchResultOnOption(event.target.value);
		optionId.set(event.target.value);
		console.log('optionId:', $optionId);
		hasSelected = false;
		fetchClassrooms();
	}

	import '../../../components/dropdownAndList.css';
</script>

<div id="options-container">
	<SelectBoxOptions
		label={'Aftenskole'}
		selected={selectedSchool}
		idKey={'school_id'}
		optionName={'name'}
		{options}
		onOptionChange={handleSchoolChange}
	/>

	<div id="button-and-dropdown">
		<SelectBoxOptions
			label={'Afdeling'}
			selected={''}
			idKey={'location_id'}
			optionName={'school_name'}
			options={locations}
			onOptionChange={handleOptionChange}
		/>
		{#if $optionId}
			<div class="text-center">
				<Button style="margin-top: 6px;" type="submit" color="green" on:click={addItem}
					>{modalTitle}</Button
				>
			</div>
		{/if}
	</div>

	{#if $itemList.length > 0}
		<ListItems
			idKey={'location_id'}
			collection={'locations'}
			showButtons={false}
			buttons={[]}
			showEditButton={true}
			showDeleteButton={true}
		/>
	{:else if hasSelected}
		<div>Ingen data fundet</div>
	{/if}
</div>

{#if showAddModal}
	<ModalAdd collection={'classrooms'} idKey={'location_id'} {modalTitle} />
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
