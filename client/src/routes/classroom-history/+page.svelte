<script>
	import { onMount } from 'svelte';
	import ListItems from '../../components/ListItems.svelte';
	import { displayNames } from '../../stores/dictionaryStore.js';
	import { user } from '../../stores/userStore.js';
	import { itemList } from '../../stores/itemListStore';
	import { optionId } from '../../stores/modalStore.js';
	import { buttonStoreValue } from '../../stores/buttonStore.js';

	displayNames.set({
		course_name: 'Holdnavn',
		start_time: 'Starttid',
		end_time: 'Sluttid',
		date: 'Dato',
		teacher_name: 'Underviser'
	});

	onMount(() => {
		itemList.set([]);
		fetchBookings();
	});

	function formatTime(timeString) {
		const options = { hour: '2-digit', minute: '2-digit' };
		return new Date(`1970-01-01T${timeString}Z`).toLocaleTimeString(undefined, options);
	}

	function formatDate(dateString) {
		const options = { year: 'numeric', month: 'long', day: 'numeric' };
		return new Date(dateString).toLocaleDateString(undefined, options);
	}

	// Endpoint: api/bookings/:courseId/room-history

	async function fetchBookings() {
		let formattedData = [];

		const response = await fetch(`http://localhost:8080/api/bookings/${$optionId}/room-history`, {
			credentials: 'include'
		});

		if (response.ok) {
			const result = await response.json();

			formattedData = result.data.map((item) => {
				item.date = formatDate(item.date);
				item.start_time = formatTime(item.start_time);
				item.end_time = formatTime(item.end_time);
				return item;
			});
			itemList.set(formattedData);
		} else {
			console.error(`Failed to fetch bookings`);
		}
	}
</script>

<div>
	<h2 class="pt-3 text-center">Historik over hold i lokale {$buttonStoreValue}</h2>
</div>

<ListItems idKey={$user.schoolId} collection={'bookings'} showButtons={false} />
