<script>
	import { onMount } from 'svelte';
	import ListItems from '../../components/ListItems.svelte';
	import { displayNames } from '../../stores/dictionaryStore.js';
	import { user } from '../../stores/userStore.js';
	import { itemList } from '../../stores/itemListStore';
	import { optionId } from '../../stores/modalStore.js';

	displayNames.set({
		course_id: 'Kursus ID',
		room_id: 'Lokale ID',
		start_time: 'Starttid',
		end_time: 'Sluttid',
		date: 'Dato'
	});

	onMount(() => {
		itemList.set([]);
		fetchBookings();
	});

	// api/bookings/:courseId/room-history

	async function fetchBookings() {
		const response = await fetch(`http://localhost:8080/api/bookings/${$optionId}/room-history`, {
			credentials: 'include'
		});

		if (response.ok) {
			const result = await response.json();
			itemList.set(result.data);
		} else {
			console.error(`Failed to fetch bookings`);
		}
	}
</script>

<ListItems idKey={$user.schoolId} collection={'bookings'} showButtons={false} />

<!-- buttons={[
  { id: 1, key: 'booking_id', url: '/classrooms/user', text: 'Lokaler', store: 'course_id' },
  { id: 2, key: 'booking_id', url: '/courses/location', text: 'Hold', store: 'course_id' }
]} -->
