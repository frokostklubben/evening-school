<script>
	import { onMount } from 'svelte';
	import DatePicker from '../../components/DatePicker.svelte';
	import { BASE_URL } from '../../stores/apiConfig.js';
	import { isLoading } from '../../stores/generalStore.js';
	import { user } from '../../stores/userStore.js';
	import TimePicker from '../../components/TimePicker.svelte';

	let dateRange = [new Date(), new Date()];
	let startTime;
	let endTime;
	let startDate = dateRange[0];
	let endDate = dateRange[1];
	let availableClassrooms = [];

	// $: if (endDateTime < startDateTime) {
	// 	endDateTime = new Date(startDateTime);
	// }

	$: startDate = dateRange[0];
	$: endDate = dateRange[1];

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
</script>

<div class="container">
	<!-- text-center d-flex flex-column justify-content-center -->
	<div class="sidebar">
		<form on:submit|preventDefault={fetchAvailableClassrooms}>
			<DatePicker bind:value={dateRange} id="dateRange" label="Vælg dato interval" />
			<TimePicker bind:value={startTime} id="startTime" />
			<TimePicker bind:value={endTime} id="endTime" />
			<button type="submit" class="btn btn-primary">Søg</button>
		</form>
	</div>
	<div class="main-content">
		<div class="list-group classrooms">
			{#each availableClassrooms as classroom (classroom.room_id)}
				<div class="list-group-item classroom">
					<h5 class="mb-1">{classroom.room_name} ({classroom.school_name})</h5>
					<p>Kapacitet: {classroom.capacity}</p>
					{#if classroom.purpose}
						<p class="mb-1"><strong>Formål:</strong> {classroom.purpose}</p>
					{/if}
					<p class="mb-1"><strong>Inventar:</strong></p>
					<ul class="inventory-list">
						{#each classroom.inventory as item}
							<li>{item}</li>
						{/each}
					</ul>
					<p class="mb-1"><strong>Ledige tider:</strong></p>
					<div class="available-times">
						{#each classroom.freeTimes as interval}
							<p>
								{formatDate(interval.date)}: {interval.times
									.map((t) => `${formatTime(t.start)} - ${formatTime(t.end)}`)
									.join(', ')}
							</p>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.container {
		display: flex;
		padding: 10px;
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
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
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
	.inventory-list {
		list-style-type: disc;
		padding-left: 20px;
	}
	.available-times {
		margin-top: 10px;
	}
</style>
