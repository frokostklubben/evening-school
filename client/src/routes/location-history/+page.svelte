<script>
	import { onMount } from 'svelte';
	import ListItems from '../../components/ListItems.svelte';
	import { displayNames } from '../../stores/dictionaryStore.js';
	import { user } from '../../stores/userStore.js';
	import { itemList } from '../../stores/itemListStore';
	import { optionId } from '../../stores/modalStore.js';
	import { titleStore } from '../../stores/titleStore.js';
	import GoBackButton from '../../components/GoBackButton.svelte';
	import { isLoading } from '../../stores/generalStore.js';
	import { headerKeysDanish } from '../../stores/itemListStore.js';

	headerKeysDanish.set([]);

	displayNames.set({
		room_name: 'Lokale',
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
		const [hours, minutes] = timeString.split(':');
		return `${hours}:${minutes}`;
	}

	function formatDate(dateString) {
		const options = { year: 'numeric', month: 'long', day: 'numeric' };
		return new Date(dateString).toLocaleDateString(undefined, options);
	}

	// function formatTime(timeString) {
	// 	const options = { hour: '2-digit', minute: '2-digit' };
	// 	return new Date(`1970-01-01T${timeString}Z`).toLocaleTimeString(undefined, options);
	// }

	// function formatDate(dateString) {
	// 	const options = { year: 'numeric', month: 'long', day: 'numeric' };
	// 	return new Date(dateString).toLocaleDateString(undefined, options);
	// }

	async function fetchBookings() {
		let formattedData = [];

		const response = await fetch(`http://localhost:8080/api/bookings/${$optionId}/course-history`, {
			credentials: 'include'
		});

		isLoading.set(true);

		if (response.ok) {
			isLoading.set(false);
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

<GoBackButton />

<div>
	<h2 class="pt-3 text-center">Historik lokaler for: {$titleStore}</h2>

	<ListItems idKey={$user.schoolId} collection={'location_history'} showButtons={false} />
</div>
