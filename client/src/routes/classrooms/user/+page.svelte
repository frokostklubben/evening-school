<script>
	import { onMount } from 'svelte';
	import ListItems from '../../../components/ListItems.svelte';
	import { displayNames } from '../../../stores/dictionaryStore.js';
	import { itemList } from '../../../stores/itemListStore';
	import { optionId } from '../../../stores/modalStore';
	import { BASE_URL } from '../../../stores/apiConfig.js';
	import { titleStore } from '../../../stores/titleStore.js';
	import GoBackButton from '../../../components/GoBackButton.svelte';
	import { isLoading } from '../../../stores/generalStore.js';

	displayNames.set({
		room_name: 'Rum',
		purpose: 'Formål',
		inventories: 'Inventar',
		capacity: 'Kapacitet'
	});

	onMount(() => {
		itemList.set([]);
		fetchClassrooms();
	});

	// TODO: HVORFOR er denne kode nødvendig når det er samme kode i fetchResultOnOption i DropdownAndList.svelte?
	async function fetchClassrooms() {
		const response = await fetch(`${$BASE_URL}/classrooms/${$optionId}`, {
			credentials: 'include'
		});

		isLoading.set(true);

		if (response.ok) {
			isLoading.set(false);
			const result = await response.json();
			itemList.set(result.data);
		} else {
			console.error(`Failed to fetch classrooms`);
		}
	}
</script>

<GoBackButton />

<div>
	<h2 class="pt-3 text-center">Lokaler hos {$titleStore}</h2>
</div>

<ListItems
	idKey={'room_id'}
	collection={'classrooms'}
	showButtons={true}
	showEditButton={true}
	showDeleteButton={true}
	buttons={[
		{
			id: 1,
			key: 'location_id',
			url: '/classroom-history',
			text: 'Historik',
			store: 'room_name'
		},
		{ id: 2, key: 'room_id', url: `/courses/classroom`, text: 'Hold', store: 'room_name' }
	]}
/>
