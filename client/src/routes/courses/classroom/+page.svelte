<script>
	import { displayNames } from '../../../stores/dictionaryStore.js';
	import ListItems from '../../../components/ListItems.svelte';
	import { onMount } from 'svelte';
	import { optionId } from '../../../stores/modalStore.js';
	import { BASE_URL } from '../../../stores/apiConfig.js';
	import { itemList } from '../../../stores/itemListStore.js';
	import { roomNames } from '../../../stores/roomStore.js';

	let selectedRoomName;

	displayNames.set({
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

	$: {
		const id = $optionId;
		selectedRoomName = $roomNames.find((room) => room.id === id)?.name;
	}
</script>

<h2>Oversigt over en hold i rum {selectedRoomName}</h2>

<ListItems idKey={'room_id'} collection={'courses'} showButtons={false} />
