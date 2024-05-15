<script>
	import { displayNames } from '../../../stores/dictionaryStore.js';
	import ListItems from '../../../components/ListItems.svelte';
	import { onMount } from 'svelte';
	import { optionId } from '../../../stores/modalStore.js';
	import { BASE_URL } from '../../../stores/apiConfig.js';
	import { itemList } from '../../../stores/itemListStore.js';

	displayNames.set({
		course_name: 'Kursusnavn',
		description: 'Beskrivelse'
	});

	onMount(() => {
		itemList.set([]);
		loadCourses();
	});

	async function loadCourses() {
		const response = await fetch(`${$BASE_URL}/courses/${$optionId}`, {
			credentials: 'include'
		});
		if (response.ok) {
			const result = await response.json();
			itemList.set(result.data);
			console.log($itemList);
		} else {
			console.error('Failed to load courses');
		}
	}
</script>

<h2>Oversigt over en afdelings hold</h2>

<ListItems idKey={'course_id'} collection={'courses'} showButtons={false} />
