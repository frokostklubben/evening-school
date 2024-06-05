<script>
	import { Button, Modal } from 'flowbite-svelte';
	import { toast, Toaster } from 'svelte-french-toast';
	import { BASE_URL } from '../stores/apiConfig.js';
	import { selectedItem, showEditModal, editData } from '../stores/modalStore.js';
	import { itemList } from '../stores/itemListStore.js';
	import { displayNames } from '../stores/dictionaryStore.js';
	import SelectBoxOptions from './SelectBoxOptions.svelte';
	import DatePicker from '../components/DatePicker.svelte';
	import TimePicker from '../components/TimePicker.svelte';

	export let onEditChanges;

	let itemKeys = [];
	let idKey = 'bookingId';
	let modeRange = false;

	$: teachers = $editData.teachers;
	$: locations = $editData.locations;
	$: classrooms = $editData.locations
		? $editData.locations.map((location) => location.Classrooms).flat()
		: [];

	$: selectedTeacher = $selectedItem.teacherId;
	$: selectedClassroom = $selectedItem.roomId;
	$: selectedLocation = $selectedItem.locationId;

	$: selectedDate = new Date($selectedItem.date);
	// $: selectedStartTime = $selectedItem.startTime;
	// $: selectedEndTime = $selectedItem.endTime;
	let selectedStartTime;
	let selectedEndTime;

	$: filteredClassrooms = selectedLocation
		? classrooms.filter((classroom) => classroom.location_id == selectedLocation)
		: classrooms;

	$: {
		if ($selectedItem) {
			itemKeys = Object.keys($selectedItem).filter((key) => !key.endsWith('_id'));
		}
	}

	function dateToTimeString(date) {
		return date.toTimeString().split(' ')[0];
	}

	function formatTime(time, initialTime) {
		if (!time) {
			return initialTime;
		}

		// If time is a Date object, convert it to a time string
		if (time instanceof Date) {
			return dateToTimeString(time);
		}

		// If time is already in 'HH:MM:SS' format, return it as is
		// if (time.includes(':')) {
		// 	return time;
		// }

		// If time is in 'HH:MM' format, add seconds
		return `${time}:00`;
	}

	function handleStartTimeChange(event) {
		selectedStartTime = event.detail[1];
		// I want to update the startTime of selectedItem with  event.detail[1];
		selectedStartTime = formatTime(selectedStartTime, $selectedItem.startTime);

		// Update the startTime of selectedItem
		selectedItem.update((value) => {
			return { ...value, startTime: selectedStartTime };
		});
	}

	function handleEndTimeChange(event) {
		console.log('selectedItem before:', $selectedItem);

		selectedEndTime = event.detail[1];

		selectedEndTime = formatTime(selectedEndTime, $selectedItem.endTime);

		// HER skal det lægges til 00
		console.log('selectedEndTime event detail:', selectedEndTime);

		selectedItem.update((value) => {
			return { ...value, endTime: selectedEndTime };
		});

		console.log('selectedItem after:', $selectedItem);
	}

	async function saveChanges() {
		//	console.log('><<<<<<<<<<<<<<<<<< saveChanges:', selectedEndTime);

		let payload = {
			teacherId: selectedTeacher,
			roomId: selectedClassroom,
			locationId: selectedLocation,
			date: selectedDate,
			startTime: selectedStartTime,
			endTime: selectedEndTime
			// startTime: formatTime(selectedStartTime, $selectedItem.startTime),
			// endTime: formatTime(selectedEndTime, $selectedItem.endTime)
		};

		try {
			const response = await fetch(`${$BASE_URL}/bookings/${$selectedItem[idKey]}`, {
				credentials: 'include',
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			});

			const result = await response.json();

			console.log('result.data:', result.data);

			if (response.ok) {
				toast.success('Opdatering vellykket!');

				const index = $itemList.findIndex((item) => {
					return item['bookingId'] == $selectedItem['bookingId'];
				});

				if (index !== -1) {
					$itemList[index] = $selectedItem;
				}

				showEditModal.set(false);
			} else {
				toast.error('Fejl ved opdatering:', error.message);
			}
		} catch (error) {
			toast.error('Fejl ved opdatering:', error.message);
		}
	}

	function handleLocationChange(event) {
		selectedLocation = Number(event.target.value);
		selectedClassroom = null;
	}

	function handleClassroomChange(event) {
		selectedClassroom = Number(event.target.value);
	}

	function handleTeacherChange(event) {
		selectedTeacher = Number(event.target.value);
	}
</script>

<Modal
	title={`Redigér Booking ID #${$selectedItem['bookingId']}`}
	bind:open={$showEditModal}
	autoclose
>
	<div class="container-fluid mt-3">
		<div class="row justify-content-center">
			<div class="col-md-8">
				<form on:submit|preventDefault={saveChanges} class="needs-validation">
					<div class="mb-3">
						<label for="courseName" class="form-label">{$displayNames['courseName']}</label>
						<input
							type="text"
							class="form-control"
							id="courseName"
							bind:value={$selectedItem['courseName']}
							readonly
						/>

						<SelectBoxOptions
							label={'Afdeling'}
							selected={selectedLocation}
							idKey={'location_id'}
							optionName={'school_name'}
							options={locations}
							onOptionChange={handleLocationChange}
						/>

						<SelectBoxOptions
							label={'Lokale'}
							selected={selectedClassroom}
							idKey={'room_id'}
							optionName={'room_name'}
							options={filteredClassrooms}
							onOptionChange={handleClassroomChange}
						/>

						<SelectBoxOptions
							label={'Underviser'}
							selected={selectedTeacher}
							idKey={'teacher_id'}
							optionName={'email'}
							options={teachers}
							onOptionChange={handleTeacherChange}
						/>
					</div>
					<DatePicker
						bind:value={$selectedItem.date}
						id={new Date($selectedItem.date)}
						label="Vælg dato"
						{modeRange}
					/>
					<TimePicker
						bind:value={$selectedItem.startTime}
						id="startTime"
						onTimeChange={handleStartTimeChange}
					/>
					<TimePicker
						bind:value={$selectedItem.endTime}
						id="endTime"
						onTimeChange={handleEndTimeChange}
					/>
				</form>
			</div>
		</div>
	</div>

	<svelte:fragment slot="footer">
		<div class="container">
			<div class="text-center">
				<Button
					class="me-2"
					type="submit"
					color="green"
					on:click={() => {
						onEditChanges();
						saveChanges();
					}}
					disabled={!selectedLocation || !selectedClassroom || !selectedTeacher}>Gem</Button
				>
				<Button color="red">Afbryd</Button>
			</div>
		</div>
	</svelte:fragment>
</Modal>

<Toaster />
