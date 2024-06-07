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
	import { headerKeysDanish } from '../stores/itemListStore.js';

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
	let selectedStartTime = $selectedItem.startTime;
	let selectedEndTime = $selectedItem.endTime;

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

		// If time is in 'HH:MM' format, add seconds
		return `${time}:00`;
	}

	function handleStartTimeChange(event) {
		selectedStartTime = event.detail[1];
		selectedStartTime = formatTime(selectedStartTime, $selectedItem.startTime);

		selectedItem.update((value) => {
			return { ...value, startTime: selectedStartTime };
		});
	}

	function handleEndTimeChange(event) {
		selectedEndTime = event.detail[1];
		selectedEndTime = formatTime(selectedEndTime, $selectedItem.endTime);

		selectedItem.update((value) => {
			return { ...value, endTime: selectedEndTime };
		});
	}

	async function saveChanges() {
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

			// console.log('result.data:', result.data);
			// console.log('idKey:', idKey);
			// console.log('$selectedItem[idKey]:', $selectedItem[idKey]); // Add this line

			if (response.ok) {
				onEditChanges(result.data); // Pass the updated data to the parent component
				toast.success('Opdatering vellykket!');

				const index = $itemList.findIndex((item) => item[idKey] === $selectedItem[idKey]);

				if (index !== -1) {
					const editedBooking = result.data;

					// console.log('headerkeysDanish:', $headerKeysDanish);
					// console.log('editedBooking:', editedBooking);
					// console.log('displaynames', $displayNames);

					// let newBooking = {};
					// Object.keys(editedBooking).forEach((key, index) => {
					// newBooking[$headerKeysDanish[index]] = editedBooking[key];
					// });

					// let newBooking = {};
					// Object.keys(editedBooking).forEach((key) => {
					// 	newBooking[$displayNames[key]] = editedBooking[key];
					// });

					// console.log('itemlist', $itemList);
					// console.log('newBooking:', editedBooking);

					$itemList[index] = editedBooking;
				}

				/*
				if (index !== -1) {
					// Make a copy of $itemList
					let newList = [...$itemList];

					const editedBooking = result.data;
					// Update the item in the copy
					newList[index] = editedBooking

					// Set the store to the new list
					itemList.set(newList);
					
				}
				*/
	


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
						// onEditChanges();
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
