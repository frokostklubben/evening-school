<script>
	import { onMount } from 'svelte';
	import ListItems from '../../../components/ListItems.svelte';
	import SelectBoxOptions from '../../../components/SelectBoxOptions.svelte';
	import { itemList, headerKeysDanish} from '../../../stores/itemListStore';
	import { optionId, showAddModal } from '../../../stores/modalStore';
	import ModalAdd from '../../../components/ModalAdd.svelte';
	import { Button } from 'flowbite-svelte';
	import { BASE_URL } from '../../../stores/apiConfig.js';
	import { displayNames } from '../../../stores/dictionaryStore.js';
	import { selectionsLoading, secondSelectionsLoading } from '../../../stores/generalStore.js';
	import '../../../components/dropdownAndList.css';
	import Spinner from '../../../components/Spinner.svelte';

	let modalTitle = 'Nyt lokale';
	let locations = [];
	let options = [];
	$: selectedSchool = 'empty';
	let hasSelected = false;
	let resultLoaded = false;

	displayNames.set({
		room_name: 'Lokale',
		purpose: 'Formål',
		capacity: 'Kapacitet',
		inventories: 'Inventar'
	});

	onMount(() => {
		headerKeysDanish.set([]);
		secondSelectionsLoading.set(true);
		selectionsLoading.set(true);
		$optionId = 'empty';
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
			selectionsLoading.set(false);
		} else {
			console.error(`Failed to fetch schools`);
		}
	}

	async function fetchClassrooms() {
		itemList.set([]);
		const response = await fetch(`${$BASE_URL}/classrooms/${$optionId}`, {
			credentials: 'include'
		});

		if (response.ok) {
			const result = await response.json();
			itemList.set(result.data);
			resultLoaded = true;
		} else {
			console.error(`Failed to fetch classrooms: ${response.status} ${response.statusText}`);
		}

	}

	function handleSchoolChange(event) {
		itemList.set([]);
		if (event.target.value != 'empty') {
			optionId.set('empty')
			selectedSchool = Number(event.target.value);
			fetchLocations();
		}  else {
			selectedSchool = 'empty'
			locations = [];
			hasSelected = false;
			optionId.set('empty');
		}
	}

	async function fetchLocations() {
		secondSelectionsLoading.set(true);
		const response = await fetch(`${$BASE_URL}/locations/${selectedSchool}`, {
			credentials: 'include'
		});

		if (response.ok) {
			const result = await response.json();
			locations = result.data;
			secondSelectionsLoading.set(false);
		} else {
			console.error(`Failed to fetch locations`);
		}
	}

	function addItem() {
		showAddModal.set(true);
	}

	function handleOptionChange(event) {
		if (event.target.value != 'empty'){
			resultLoaded = false;
			itemList.set([]);
			optionId.set(event.target.value);
			fetchClassrooms();
		} else {
			optionId.set('empty');
			itemList.set([]);
		}
	}
</script>

<div id="options-container">
	{#if !$selectionsLoading}
		<SelectBoxOptions
			label={'Aftenskole'}
			selected={selectedSchool}
			idKey={'school_id'}
			optionName={'name'}
			{options}
			onOptionChange={handleSchoolChange}
		/>
		<div id="button-and-dropdown">
			{#if !$secondSelectionsLoading && selectedSchool != 'empty'}
						<SelectBoxOptions
							label={'Afdeling'}
							selected={'empty'}
							idKey={'location_id'}
							optionName={'school_name'}
							options={locations}
							onOptionChange={handleOptionChange}
						/>
			{:else if $secondSelectionsLoading && selectedSchool != 'empty'}
				<Spinner />
			{/if}
		{#if $optionId != "empty" && selectedSchool != 'empty'}
			<div class="text-center">
				<Button style="margin-top: 6px;" type="submit" color="green" on:click={addItem}
					>{modalTitle}</Button
				>
			</div>
		{/if}
		</div>

		{#if $optionId != "empty" && selectedSchool != 'empty' && resultLoaded}
		<ListItems
			idKey={'room_id'}
			collection={'classrooms'}
			showButtons={false}
			buttons={[]}
			showEditButton={true}
			showDeleteButton={true}
		/>
		{:else if $optionId != "empty" && selectedSchool != 'empty' && !resultLoaded}
			<Spinner />
		{/if}

	{:else}
	<Spinner />
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
