<script>
	import { onMount } from 'svelte';
	import ListItems from '../../../components/ListItems.svelte';
	import { displayNames } from '../../../stores/dictionaryStore.js';
	import { itemList } from '../../../stores/itemListStore';
	import { optionId } from '../../../stores/modalStore';
	import { BASE_URL } from '../../../stores/apiConfig.js';
	import { roomNames } from '../../../stores/roomStore.js';

	displayNames.set({
		room_name: 'Rum',
		room_id: 'Rum ID',
		location_id: 'Afdelings ID',
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

			const names = result.data.map((item) => ({ id: item.room_id, name: item.room_name }));
			roomNames.set(names);
		} else {
			console.error(`Failed to fetch classrooms`);
		}
	}
</script>

<ListItems
	idKey={'room_id'}
	collection={'classrooms'}
	showButtons={true}
	buttons={[
		{ id: 1, key: 'location_id', url: '/courses/history', text: 'Se historik' },
		{ id: 2, key: 'room_id', url: `/courses/classroom`, text: 'Se hold' }
	]}
/>
