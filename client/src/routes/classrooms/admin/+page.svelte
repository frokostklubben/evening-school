<script>
	import { onMount } from 'svelte';
	import { displayNames } from '../../../stores/dictionaryStore.js';
	import { itemList } from '../../../stores/itemListStore';
	import { optionId } from '../../../stores/modalStore';
	import { BASE_URL } from '../../../stores/apiConfig.js';
	import { buttonStoreValue } from '../../../stores/buttonStore.js';
	import DropdownAndList from '../../../components/DropdownAndList.svelte';

	displayNames.set({
		room_name: 'Lokale',
		purpose: 'Formål',
		inventories: 'Inventar',
		capacity: 'Kapacitet'
	});

	onMount(() => {
		itemList.set([]);
		fetchClassrooms();
		buttonStoreValue.set('');
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

<div>
	<h2 class="pt-3 text-center">Lokaler hos {$buttonStoreValue}</h2>
</div>

<DropdownAndList
	listIdKey={'room_id'}
	listCollection={'classrooms'}
	optionsCollection={'schools'}
	optionsIdKey={'school_id'}
	label={'Aftenskole'}
	modalTitle={'lokale'}
	optionName={'name'}
	showButtons={true}
/>
