<script>
	import { bookingData } from '../../stores/bookingData.js';
	import { saveBooking, checkNewDateAndTime } from '../../services/bookingService.js';
	import { toast } from 'svelte-french-toast';

	let checkedBookings = [];
	let sortOrderDate = 'asc';
	let sortOrderStatus = 'asc';
	let showChangedColumn = false;

	$: checkedBookings = $bookingData.checkedBookings || [];
	$: showChangedColumn = checkedBookings.some((booking) => booking.changed);

	function deleteSingleBooking(bookingToBeDeleted) {
		checkedBookings = checkedBookings.filter((booking) => booking !== bookingToBeDeleted);
		bookingData.update((data) => {
			data.checkedBookings = checkedBookings;
			return data;
		});
	}

	function sortCheckedBookingByDate() {
		checkedBookings = checkedBookings.sort((a, b) => {
			let dateA = new Date(a.date),
				dateB = new Date(b.date);
			return sortOrderDate === 'asc' ? dateA - dateB : dateB - dateA;
		});
		sortOrderDate = sortOrderDate === 'asc' ? 'desc' : 'asc';
		bookingData.update((data) => {
			data.checkedBookings = checkedBookings;
			return data;
		});
	}

	function sortCheckedBookingByConflict() {
		checkedBookings = checkedBookings.sort((a, b) => {
			if (a.conflict && !b.conflict) return sortOrderStatus === 'asc' ? -1 : 1;
			if (b.conflict && !a.conflict) return sortOrderStatus === 'asc' ? 1 : -1;

			let dateA = new Date(a.date),
				dateB = new Date(b.date);
			return sortOrderStatus === 'asc' ? dateA - dateB : dateB - dateA;
		});

		sortOrderStatus = sortOrderStatus === 'asc' ? 'desc' : 'asc';
		bookingData.update((data) => {
			data.checkedBookings = checkedBookings;
			return data;
		});
	}

	async function handleSaveBooking() {
		try {
			await saveBooking(checkedBookings);
			toast.success('Booking saved successfully');
		} catch (error) {
			toast.error('Error saving booking');
		}
	}

	async function handleCheckNewDateAndTime(bookingToCheck) {
		try {
			await checkNewDateAndTime(bookingToCheck);
		} catch (error) {
			toast.error('Error checking new date and time');
		}
	}
</script>

<div class="border border-2 p-3 m-3">
	<p><strong>Trin 4</strong></p>
	<table class="table">
		<thead>
			<tr>
				<th scope="col" class="sortable" on:click={sortCheckedBookingByDate}
					>Dato {sortOrderDate === 'asc' ? '▲' : '▼'}</th
				>
				<th scope="col">Starttidspunkt</th>
				<th scope="col">Sluttidspunkt</th>
				<th scope="col" class="sortable" on:click={sortCheckedBookingByConflict}
					>Status {sortOrderStatus === 'asc' ? '▲' : '▼'}</th
				>
				<th scope="col" class="col-4">Ny tid</th>
				{#if showChangedColumn}
					<th scope="col"></th>
				{/if}
				<th scope="col"></th>
			</tr>
		</thead>
		<tbody>
			{#each checkedBookings as booking}
				<tr>
					<td
						>{booking.date.toLocaleDateString('da-DK', { weekday: 'long' })[0].toUpperCase() +
							booking.date.toLocaleDateString('da-DK', { weekday: 'long' }).slice(1).toLowerCase()}
						{booking.date.getDate()}/{booking.date.getMonth() + 1}/{booking.date.getFullYear()}</td
					>
					<td>{booking.startTime}</td>
					<td>{booking.endTime}</td>
					<td>
						{#if booking.holidayConflict}
							<div>
								Lukket - {booking.holidayConflict.name}, {new Date(
									booking.holidayConflict.start_date
								).toLocaleDateString()} - {new Date(
									booking.holidayConflict.end_date
								).toLocaleDateString()}
							</div>
						{:else if booking.conflicts}
							<span class="text-danger">Ikke ledig: </span>
							{booking.bookingConflicts
								.map((conflict) => {
									const [startHour, startMinute] = conflict.start_time.split(':');
									const [endHour, endMinute] = conflict.end_time.split(':');
									return `${startHour}:${startMinute}-${endHour}:${endMinute}`;
								})
								.join(', ')}
						{:else}
							<span class="text-success">Ledig</span>
						{/if}
					</td>
					<td>
						<input
							type="date"
							min={new Date().toISOString().split('T')[0]}
							bind:value={booking.newDate}
						/>
						<input type="time" bind:value={booking.newStartTime} step="900" />
						<input type="time" bind:value={booking.newEndTime} step="900" />
						<button
							class="btn btn-primary"
							on:click={() => handleCheckNewDateAndTime(booking)}
							disabled={!booking.newDate || !booking.newStartTime || !booking.newEndTime}
							>Tjek</button
						>
					</td>
					{#if showChangedColumn}
						<td>{booking.changed ? 'Ændret tidspunkt' : ''}</td>
					{/if}
					<td>
						<button class="btn" on:click={() => deleteSingleBooking(booking)}
							><i class="bi bi-trash-fill"></i></button
						>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<button
		class="btn btn-primary"
		on:click={handleSaveBooking}
		disabled={!checkedBookings.every((booking) => !booking.conflict) || !checkedBookings.length}
		>Færdiggør booking</button
	>
</div>
