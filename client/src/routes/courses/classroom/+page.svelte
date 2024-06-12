<script>
	import { displayNames } from '../../../stores/dictionaryStore.js';
	import ListItems from '../../../components/ListItems.svelte';
	import { onMount } from 'svelte';
	import { optionId } from '../../../stores/modalStore.js';
	import { BASE_URL } from '../../../stores/apiConfig.js';
	import { itemList } from '../../../stores/itemListStore.js';
	import { titleStore } from '../../../stores/titleStore.js';
	import GoBackButton from '../../../components/GoBackButton.svelte';

	displayNames.set({
		// course_id: 'Kursusnr.',
		course_name: 'Kursusnavn',
		description: 'Beskrivelse'
	});

	onMount(() => {
		loadCoursesByRoomId();
	});

	async function loadCoursesByRoomId() {
		const response = await fetch(`${$BASE_URL}/courses/classroom/${$optionId}`, {
			credentials: 'include'
		});
		if (response.ok) {
			const result = await response.json();
			itemList.set(result.data);
		} else {
			console.error('Failed to load courses');
		}
	}
</script>

<GoBackButton />

<div>
	<h2 class="pt-3 text-center">Oversigt over hold i lokale {$titleStore}</h2>
</div>

<ListItems
	idKey={'room_id'}
	collection={'courses'}
	showButtons={false}
	showEditButton={true}
	showDeleteButton={true}
/>
