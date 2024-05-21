<script>
	import { onMount } from 'svelte';
	import ListItems from '../../../components/ListItems.svelte';
	import { displayNames } from '../../../stores/dictionaryStore.js';
	import { itemList } from '../../../stores/itemListStore';
	import { optionId } from '../../../stores/modalStore';
	import { BASE_URL } from '../../../stores/apiConfig.js';
	import { buttonStoreValue } from '../../../stores/buttonStore.js';

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

	async function fetchClassrooms() {
		const response = await fetch(`${$BASE_URL}/classrooms/purposes/${$optionId}`, {
			credentials: 'include'
		});

		if (response.ok) {
			const result = await response.json();
			itemList.set(result.data);
		} else {
			console.error(`Failed to fetch classrooms`);
		}
	}
</script>

<!-- TODO: Hvis man går tilbage i browseren får man undefined! -->
<div>
	<h2 class="pt-3 text-center">Lokaler hos {$buttonStoreValue}</h2>
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
