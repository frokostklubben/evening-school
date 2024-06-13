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
	$: ignoreSetupTime = false;

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

	async function checkAndSaveBookingDate() {
		let booking = [
			{
				course_id: $selectedItem.courseId,
				room_id: $selectedItem.roomId,
				startTime: new Date($selectedItem.startTime).toTimeString().split(' ')[0], // 'HH:MM:SS' format
				endTime: new Date($selectedItem.endTime).toTimeString().split(' ')[0],
				date: new Date($selectedItem.date).toISOString()
			}
		];

		let allStartDatesBeforeEndDates = booking.every(
			(booking) => booking.startTime < booking.endTime
		);

		if (!allStartDatesBeforeEndDates) {
			toast.error('Starttidspunkt skal være før sluttidspunkt', { duration: 5000 });
			return;
		}

		try {
			const response = await fetch(`${$BASE_URL}/check-booking-dates`, {
				credentials: 'include',
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ bookingDates: booking, ignoreSetupTime })
			});

			if (response.ok) {
				let result = await response.json();
				result.data[0].bookingConflicts = result.data[0].bookingConflicts?.filter((item) => item.booking_id !== $selectedItem.bookingId);
				
				if (result.data[0].bookingConflicts?.length > 0) {
					toast.error('Konflikt med eksisterende booking', { duration: 5000 });
				} else {
					saveChanges();
				}

				booking = result.data.map((booking) => ({
					...booking,
					date: new Date(booking.date)
				}));
			} else {
				toast.error('Fejl ved opdatering:');
			}
		} catch (error) {
			console.error('Error saving booking:', error);
		}
	}

	async function saveChanges() {
		let payload = {
			teacherId: selectedTeacher,
			roomId: selectedClassroom,
			locationId: selectedLocation,
			date: selectedDate,
			startTime: selectedStartTime,
			endTime: selectedEndTime
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

			if (response.ok) {
				toast.success('Opdatering vellykket!');

				const index = $itemList.findIndex((item) => item[idKey] === $selectedItem[idKey]);

				const editedBooking = result.data;

				if (index !== -1) {
					itemList.update((items) => {
						items[index] = editedBooking;
						return items;
					});
				}

				onEditChanges(editedBooking);
				showEditModal.set(false);
			} else {
				toast.error('Bookingen kunne ikke opdateres');
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
				<form class="needs-validation">
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

						<input
							type="text"
							class="form-control"
							id="courseName"
							bind:value={$selectedItem['teacherEmail']}
							readonly
						/>
						
		
					</div>

					<DatePicker
						bind:value={$selectedItem.date}
						id={new Date($selectedItem.date)}
						label="Vælg dato"
						{modeRange}
					/>

					<div class="mb-3">
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
					</div>

					<div class="mb-3">
						<div class="d-flex align-content-center gap-2">
							<label for="setup-time" class="form-label"
								>Ignorér klargøringstid (15 minutter):</label
							>
							<div class="form-check form-check-inline">
								<input
									class="form-check-input border-3 p-2 rounded"
									type="checkbox"
									id={'setup-time'}
									bind:checked={ignoreSetupTime}
								/>
							</div>
						</div>
					</div>
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
						checkAndSaveBookingDate();
					}}
					disabled={!selectedLocation || !selectedClassroom || !selectedTeacher}>Gem</Button
				>
				<Button color="red">Afbryd</Button>
			</div>
		</div>
	</svelte:fragment>
</Modal>

<Toaster />
