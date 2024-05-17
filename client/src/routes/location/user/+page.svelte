<script>
	import { onMount } from 'svelte';
	import ListItems from '../../../components/ListItems.svelte';
	import { displayNames } from '../../../stores/dictionaryStore.js';
	import { user } from '../../../stores/userStore.js';
	import { itemList } from '../../../stores/itemListStore';

	displayNames.set({
		school_name: 'Skole',
		zip_code: 'Postnummer',
		city: 'By',
		street_name: 'Vejnavn',
		street_number: 'Nr.'
	});

	onMount(() => {
		itemList.set([]);
		fetchLocations();
	});

	async function fetchLocations() {
		const response = await fetch(`http://localhost:8080/api/locations/${$user.schoolId}`, {
			credentials: 'include'
		});

		if (response.ok) {
			const result = await response.json();
			itemList.set(result.data);
			// save locationStore here
		} else {
			console.error(`Failed to fetch locations`);
		}
	}
</script>

<ListItems
	idKey={$user.schoolId}
	collection={'locations'}
	showButtons={true}
	buttons={[
		{ id: 1, key: 'location_id', url: '/courses/location', text: 'Se hold' },
		{ id: 2, key: 'location_id', url: '/classrooms/user', text: 'Se lokaler' }
	]}
/>
