<script>
	import DatePickerOneDay from '../bookingComponents/DatePickerOneDay.svelte';
	import { allInfoGiven, bookingData } from '../../stores/bookingStore';
	import { get } from 'svelte/store';

	let weeks = $bookingData.weeks;
	let selectedDays = $bookingData.selectedDays;
	let ignoreSetupTime = $bookingData.ignoreSetupTime;
	let courseStartDate = new Date($bookingData.courseStartDate);
	let selectedClassroom = $bookingData.selectedClassroom;

	let startTime = '08:00';
	let endTime = '23:00';

	let days = [
		{
			name: 'Mandag',
			startTime: '08:00',
			endTime: '23:00',
			selected: false,
			startDate: '',
			room_id: selectedClassroom
		},
		{
			name: 'Tirsdag',
			startTime: '08:00',
			endTime: '23:00',
			selected: false,
			startDate: '',
			room_id: selectedClassroom
		},
		{
			name: 'Onsdag',
			startTime: '08:00',
			endTime: '23:00',
			selected: false,
			startDate: '',
			room_id: selectedClassroom
		},
		{
			name: 'Torsdag',
			startTime: '08:00',
			endTime: '23:00',
			selected: false,
			startDate: '',
			room_id: selectedClassroom
		},
		{
			name: 'Fredag',
			startTime: '08:00',
			endTime: '23:00',
			selected: false,
			startDate: '',
			room_id: selectedClassroom
		},
		{
			name: 'Lørdag',
			startTime: '08:00',
			endTime: '23:00',
			selected: false,
			startDate: '',
			room_id: selectedClassroom
		},
		{
			name: 'Søndag',
			startTime: '08:00',
			endTime: '23:00',
			selected: false,
			startDate: '',
			room_id: selectedClassroom
		}
	];

	function toggleDay(day) {
		day.selected = !day.selected;
		if (day.selected) {
			selectedDays = [...selectedDays, day];
		} else {
			selectedDays = selectedDays.filter((d) => d.name !== day.name);
		}
		updateAllInfoGiven();
		updateBookingData();
	}

	function updateStartTime(day, event) {
		day.startTime = event.target.value;
		updateAllInfoGiven();
		updateBookingData();
	}

	function updateEndTime(day, event) {
		day.endTime = event.target.value;
		updateAllInfoGiven();
		updateBookingData();
	}

	function updateStartDate(day, event) {
		day.startDate = event.target.value;
		updateAllInfoGiven();
		updateBookingData();
	}

	function updateStartDates(event) {
		let startDateCopy = new Date(event.detail[0]);
		let dayOfWeek = startDateCopy.getUTCDay();
		if (dayOfWeek === 0) dayOfWeek = 7;
		startDateCopy.setUTCDate(startDateCopy.getUTCDate() - dayOfWeek + 1);

		days.forEach((day, index) => {
			let dayDate = new Date(startDateCopy);
			dayDate.setUTCDate(dayDate.getUTCDate() + index);
			day.startDate = dayDate.toISOString().split('T')[0];
		});
		days = [...days];
		updateAllInfoGiven();
		updateBookingData();
	}

	function applyTimeRangeToAllDays() {
		days = days.map((day) => ({
			...day,
			startTime: startTime,
			endTime: endTime
		}));
		updateAllInfoGiven();
		updateBookingData();
	}

	function updateAllInfoGiven() {
		const allInfo =
			selectedDays.length >= 1 &&
			selectedDays.every(
				(day) => day.startTime !== '' && day.endTime !== '' && day.startDate !== ''
			);
		allInfoGiven.set(allInfo);
	}

	function updateBookingData() {
		bookingData.update((data) => ({
			...data,
			weeks,
			selectedDays,
			ignoreSetupTime,
			courseStartDate:
				courseStartDate instanceof Date ? courseStartDate.toISOString() : courseStartDate
		}));
	}
</script>

<div class="border border-2 p-3 m-3">
	<p><strong>Trin 3</strong></p>
	<div class="mb-3">
		<label for="weeks" class="form-label">Antal uger:</label>
		<input type="number" id="weeks" name="weeks" class="form-control" bind:value={weeks} min="1" />
	</div>
	<div class="mb-3">
		<label for="startdate" class="form-label">Vælg en dato fra startugen:</label>
		<DatePickerOneDay
			id="startdate"
			bind:date={courseStartDate}
			label="Start Date"
			on:dateChange={updateStartDates}
		/>
	</div>
	<div class="mb-3">
		<div class="d-flex align-content-center gap-2">
			<label for="setup-time" class="form-label">Ignorér klargøringstid (15 minutter):</label>
			<div class="form-check form-check-inline">
				<input
					class="form-check-input border-3 p-2 rounded"
					type="checkbox"
					id="setup-time"
					bind:checked={ignoreSetupTime}
				/>
			</div>
		</div>

		{#if new Date(courseStartDate) > new Date()}
			<div class="mb-3">
				<label for="timeRange" class="form-label">Vælg tidsinterval for alle dage:</label>
				<div class="d-flex align-items-center gap-2">
					<input type="time" id="startTime" bind:value={startTime} />
					<span>til</span>
					<input type="time" id="endTime" bind:value={endTime} />
					<button type="button" class="btn btn-secondary" on:click={applyTimeRangeToAllDays}
						>Anvend til alle dage</button
					>
				</div>
			</div>

			<table class="table">
				<thead>
					<tr>
						<th scope="col">Vælg</th>
						<th scope="col">Dag</th>
						<th scope="col">Start</th>
						<th scope="col">Slut</th>
						<th scope="col">Dato</th>
					</tr>
				</thead>
				<tbody>
					{#each days as day}
						{#if day.startDate >= new Date().toISOString().split('T')[0]}
							<tr>
								<td>
									<input
										type="checkbox"
										bind:group={selectedDays}
										value={day}
										on:change={() => toggleDay(day)}
									/>
								</td>
								<td>{day.name}</td>
								<td>
									<input
										type="time"
										step="900"
										bind:value={day.startTime}
										on:change={(event) => updateStartTime(day, event)}
									/>
								</td>
								<td>
									<input
										type="time"
										step="900"
										bind:value={day.endTime}
										on:change={(event) => updateEndTime(day, event)}
									/>
								</td>
								<td>
									<input
										type="date"
										min={new Date().toISOString().split('T')[0]}
										bind:value={day.startDate}
										on:change={(event) => updateStartDate(day, event)}
									/>
								</td>
							</tr>
						{/if}
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</div>

<!-- <script>
 	import DatePickerOneDay from '../bookingComponents/DatePickerOneDay.svelte';
	import { allInfoGiven } from '../../stores/bookingStore';

	export let weeks = 1;
	export let selectedDays = [];
	export let ignoreSetupTime = false;
	export let courseStartDate = new Date();
	let startTime = '08:00';
	let endTime = '23:00';

	let days = [
		{
			name: 'Mandag',
			startTime: '08:00',
			endTime: '23:00',
			selected: false,
			startDate: '',
			room_id: null
		},
		{
			name: 'Tirsdag',
			startTime: '08:00',
			endTime: '23:00',
			selected: false,
			startDate: '',
			room_id: null
		},
		{
			name: 'Onsdag',
			startTime: '08:00',
			endTime: '23:00',
			selected: false,
			startDate: '',
			room_id: null
		},
		{
			name: 'Torsdag',
			startTime: '08:00',
			endTime: '23:00',
			selected: false,
			startDate: '',
			room_id: null
		},
		{
			name: 'Fredag',
			startTime: '08:00',
			endTime: '23:00',
			selected: false,
			startDate: '',
			room_id: null
		},
		{
			name: 'Lørdag',
			startTime: '08:00',
			endTime: '23:00',
			selected: false,
			startDate: '',
			room_id: null
		},
		{
			name: 'Søndag',
			startTime: '08:00',
			endTime: '23:00',
			selected: false,
			startDate: '',
			room_id: null
		}
	];

	function toggleDay(day) {
		day.selected = !day.selected;
		if (day.selected) {
			selectedDays = [...selectedDays, day];
		} else {
			selectedDays = selectedDays.filter((d) => d.name !== day.name);
		}
		updateAllInfoGiven();
	}

	function updateStartTime(day, event) {
		day.startTime = event.target.value;
		updateAllInfoGiven();
	}

	function updateEndTime(day, event) {
		day.endTime = event.target.value;
		updateAllInfoGiven();
	}

	function updateStartDate(day, event) {
		day.startDate = event.target.value;
		updateAllInfoGiven();
	}

	function updateStartDates(event) {
		let startDateCopy = new Date(event.detail[0]);
		let dayOfWeek = startDateCopy.getUTCDay();
		if (dayOfWeek === 0) dayOfWeek = 7;
		startDateCopy.setUTCDate(startDateCopy.getUTCDate() - dayOfWeek + 1);

		days.forEach((day, index) => {
			let dayDate = new Date(startDateCopy);
			dayDate.setUTCDate(dayDate.getUTCDate() + index);
			day.startDate = dayDate.toISOString().split('T')[0];
		});
		days = [...days];
		updateAllInfoGiven();
	}

	function applyTimeRangeToAllDays() {
		days = days.map((day) => ({
			...day,
			startTime: startTime,
			endTime: endTime
		}));
		updateAllInfoGiven();
	}

	function updateAllInfoGiven() {
		const allInfo =
			selectedDays.length >= 1 &&
			selectedDays.every(
				(day) => day.startTime !== '' && day.endTime !== '' && day.startDate !== ''
			);
		allInfoGiven.set(allInfo);
	}
</script>

<div class="border border-2 p-3 m-3">
	<p><strong>Trin 3</strong></p>
	<div class="mb-3">
		<label for="weeks" class="form-label">Antal uger:</label>
		<input type="number" id="weeks" name="weeks" class="form-control" bind:value={weeks} min="1" />
	</div>
	<div class="mb-3">
		<label for="startdate" class="form-label">Vælg en dato fra startugen:</label>
		<DatePickerOneDay
			id="startdate"
			bind:date={courseStartDate}
			label="Start Date"
			on:dateChange={updateStartDates}
		/>
	</div>
	<div class="mb-3">
		<div class="d-flex align-content-center gap-2">
			<label for="setup-time" class="form-label">Ignorér klargøringstid (15 minutter):</label>
			<div class="form-check form-check-inline">
				<input
					class="form-check-input border-3 p-2 rounded"
					type="checkbox"
					id="setup-time"
					bind:checked={ignoreSetupTime}
				/>
			</div>
		</div>

		{#if new Date(courseStartDate) > new Date()}
			<div class="mb-3">
				<label for="timeRange" class="form-label">Vælg tidsinterval for alle dage:</label>
				<div class="d-flex align-items-center gap-2">
					<input type="time" id="startTime" bind:value={startTime} />
					<span>til</span>
					<input type="time" id="endTime" bind:value={endTime} />
					<button type="button" class="btn btn-secondary" on:click={applyTimeRangeToAllDays}
						>Anvend til alle dage</button
					>
				</div>
			</div>

			<table class="table">
				<thead>
					<tr>
						<th scope="col">Vælg</th>
						<th scope="col">Dag</th>
						<th scope="col">Start</th>
						<th scope="col">Slut</th>
						<th scope="col">Dato</th>
					</tr>
				</thead>
				<tbody>
					{#each days as day}
						{#if day.startDate >= new Date().toISOString().split('T')[0]}
							<tr>
								<td>
									<input
										type="checkbox"
										bind:group={selectedDays}
										value={day}
										on:change={() => toggleDay(day)}
									/>
								</td>
								<td>{day.name}</td>
								<td>
									<input
										type="time"
										step="900"
										bind:value={day.startTime}
										on:change={(event) => updateStartTime(day, event)}
									/>
								</td>
								<td>
									<input
										type="time"
										step="900"
										bind:value={day.endTime}
										on:change={(event) => updateEndTime(day, event)}
									/>
								</td>
								<td>
									<input
										type="date"
										min={new Date().toISOString().split('T')[0]}
										bind:value={day.startDate}
										on:change={(event) => updateStartDate(day, event)}
									/>
								</td>
							</tr>
						{/if}
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</div> -->
