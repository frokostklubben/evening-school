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
		const [hours, minutes] = timeString.split(':');
		return `${hours}:${minutes}`;
	}

	function formatDate(dateString) {
		const options = { year: 'numeric', month: 'long', day: 'numeric' };
		return new Date(dateString).toLocaleDateString(undefined, options);
	}

	async function fetchBookings() {
		let formattedData = [];

		const response = await fetch(`http://localhost:8080/api/bookings/${$optionId}/room-history`, {
			credentials: 'include'
		});

		isLoading.set(true);

		if (response.ok) {
			isLoading.set(false);
			const result = await response.json();

			console.log('result data:', result.data);

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
	<h2 class="pt-3 text-center">Historik over hold i lokale {$titleStore}</h2>
</div>

<ListItems idKey={$user.schoolId} collection={'classroom_history'} showButtons={false} />
