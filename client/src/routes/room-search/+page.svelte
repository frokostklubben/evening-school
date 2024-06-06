<script>
	import { onMount } from 'svelte';
	import DatePicker from '../../components/DatePicker.svelte';
	import { BASE_URL } from '../../stores/apiConfig.js';
	import { user } from '../../stores/userStore.js';
	import TimePicker from '../../components/TimePicker.svelte';
	import { Modal } from 'flowbite-svelte';

	let dateRange = [new Date(), new Date()];
	let startTime;
	let endTime;
	let startDate = dateRange[0];
	let endDate = dateRange[1];
	let availableClassrooms = [];
	let showModal = false;
	let modalTitle = '';
	let selectedClassroom = null;
	let filteredClassrooms = [];
	let selectedSchool = '';
	let selectedPurpose = '';

	$: startDate = dateRange[0];
	$: endDate = dateRange[1];

	$: filteredClassrooms = availableClassrooms.filter((classroom) => classroom.freeTimes.length > 0);

	$: filteredClassrooms = availableClassrooms.filter((classroom) => {
		return (
			classroom.freeTimes.length > 0 &&
			(!selectedSchool || classroom.school_name === selectedSchool) &&
			(!selectedPurpose || classroom.purpose === selectedPurpose)
		);
	});

	onMount(() => {
		startTime = new Date();
		startTime.setHours(8, 0, 0, 0);
		endTime = new Date();
		endTime.setHours(23, 0, 0, 0);
	});

	async function fetchAvailableClassrooms() {
		const requestData = {
			startDate: startDate,
			endDate: endDate,
			startTime: startTime,
			endTime: endTime
		};

		const response = await fetch(`${$BASE_URL}/classrooms/available/${$user.schoolId}`, {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(requestData)
		});

		if (response.ok) {
			const result = await response.json();
			availableClassrooms = result.data;
			filteredClassrooms = availableClassrooms.filter(
				(classroom) => classroom.freeTimes.length > 0
			);
		} else {
			console.error('Failed to fetch available classrooms');
		}
	}

	function formatDate(dateStr) {
		const days = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];
		const date = new Date(dateStr);
		return `${days[date.getDay()]} ${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear().toString().substr(-2)}`;
	}

	function formatTime(timeStr) {
		return timeStr.split(':')[0] + ':' + timeStr.split(':')[1];
	}

	function showAllTimes(classroom) {
		selectedClassroom = classroom;
		modalTitle = `${classroom.room_name} (${classroom.school_name})`;
		showModal = true;
	}
</script>

<div class="container">
	<div class="sidebar">
		<form on:submit|preventDefault={fetchAvailableClassrooms}>
			<DatePicker bind:value={dateRange} id="dateRange" label="Vælg dato interval" />
			<TimePicker bind:value={startTime} id="startTime" />
			<TimePicker bind:value={endTime} id="endTime" />
			<button type="submit" class="btn btn-primary">Søg</button>
		</form>
	</div>
	<div class="main-content">
		<div class="filter-section">
			<div class="filter-item">
				<label for="schoolSelect">Vælg afdeling</label>
				<select id="schoolSelect" bind:value={selectedSchool} class="filter-select">
					<option value="">Alle afd.</option>
					{#each Array.from(new Set(filteredClassrooms.map((c) => c.school_name))) as school}
						<option>{school}</option>
					{/each}
				</select>
			</div>
			<div class="filter-item">
				<label for="purposeSelect">Vælg formål</label>
				<select id="purposeSelect" bind:value={selectedPurpose} class="filter-select">
					<option value="">Alle formål</option>
					{#each Array.from(new Set(filteredClassrooms.map((c) => c.purpose))) as purpose}
						<option>{purpose}</option>
					{/each}
				</select>
			</div>
		</div>

		<div class="list-group classrooms">
			{#each filteredClassrooms as classroom (classroom.room_id)}
				<div class="list-group-item classroom">
					<h5 class="mb-1">{classroom.room_name} ({classroom.school_name})</h5>
					<p>Kapacitet: {classroom.capacity}</p>
					{#if classroom.purpose}
						<p class="mb-1"><strong>Formål:</strong> {classroom.purpose}</p>
					{/if}
					<p class="mb-1"><strong>Inventar:</strong> {classroom.inventory.join(', ')}</p>
					<div class="available-times">
						<button
							class="btn btn-primary"
							style="background-color: #d0e7f9; color: #333;"
							on:click={() => showAllTimes(classroom)}>Se alle ledige tider</button
						>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<Modal title={modalTitle} bind:open={showModal} autoclose>
	{#each selectedClassroom.freeTimes as interval}
		<p>
			{formatDate(interval.date)}: {interval.times
				.map((t) => `${formatTime(t.start)} - ${formatTime(t.end)}`)
				.join(', ')}
		</p>
	{/each}
</Modal>

<style>
	.container {
		display: flex;
		padding: 5px;
	}
	.sidebar {
		width: 400px;
		padding: 20px;
		border: 1px solid #ccc;
		border-radius: 5px;
		margin-right: 20px;
		background-color: #f8f9fa;
	}
	.main-content {
		flex-grow: 1;
	}

	.filter-section {
		display: flex;
		justify-content: flex-end;
		gap: 20px;
		margin-bottom: 20px;
	}
	.filter-item {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}
	.filter-select {
		padding: 8px;
		border-radius: 5px;
		border: 1px solid #ccc;
		background-color: #fff;
	}

	.btn {
		margin-top: 20px;
		padding: 10px 20px;
		background-color: #007bff;
		color: white;
		border: none;
		border-radius: 5px;
		cursor: pointer;
	}
	.btn:hover {
		background-color: #0056b3;
	}

	.classrooms {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 20px;
	}
	.classroom {
		border: 1px solid #ccc;
		padding: 20px;
		border-radius: 5px;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
		transition:
			transform 0.3s ease,
			box-shadow 0.3s ease;
	}
	.classroom:hover {
		transform: translateY(-5px);
		box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
	}
	.available-times {
		margin-top: 10px;
	}
</style>
