<script>
	import { displayNames } from '../../../stores/dictionaryStore.js';
	import ListItems from '../../../components/ListItems.svelte';
	import { onMount } from 'svelte';
	import { optionId } from '../../../stores/modalStore.js';
	import { BASE_URL } from '../../../stores/apiConfig.js';
	import { itemList } from '../../../stores/itemListStore.js';
	import { locationStore } from '../../../stores/locationStore.js';

	let selectedLocation = '';
	let selectedSchoolName = '';

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
		} else {
			console.error('Failed to load courses');
		}
	}

	/* 	$: {
		const id = $optionId;
		const selectedLocationObject = $locationStore.find((location) => location.id === id);
		selectedLocation = selectedLocationObject?.name;
		selectedSchoolName = selectedLocationObject?.school_name;
	} */
</script>

<h2>Hold hos {selectedLocation} på {selectedSchoolName}</h2>

<ListItems idKey={'course_id'} collection={'courses'} showButtons={false} />
