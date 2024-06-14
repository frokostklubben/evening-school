<script>
	import { onMount } from 'svelte';
	import SelectBoxOptions from '../../components/SelectBoxOptions.svelte';
	import { BASE_URL } from '../../stores/apiConfig.js';
	import { toast, Toaster } from 'svelte-french-toast';

	onMount(async () => {
		try {
			const response = await fetch(`${$BASE_URL}/booking-form-info`, {
				credentials: 'include'
			});

			if (response.ok) {
				const result = await response.json();
				teachers = result.data.teachers;
				courses = result.data.coursesWithoutBooking;
				locations = result.data.locations;
				classrooms = result.data.classrooms;

				//previousBookings is where the course is included in the previous bookings course_id
				allCourses = result.data.courses;
				let filteredBookings = result.data.filteredBookings;
				previousBookings = allCourses.filter((course) => {
					return filteredBookings.some(
						(booking) => Number(booking.course_id) === Number(course.course_id)
					);
				});

				purposes = classrooms
					.map((classroom) => classroom.classroom_purpose)
					.filter((classroom) => classroom !== null);

				let purposeMap = new Map();
				purposes.forEach((obj) => {
					purposeMap.set(obj.purpose, obj);
				});
				purposes = Array.from(purposeMap.values());
			}
		} catch (error) {
			console.error(error);
		}
	});

	let selectedTeacher = 'empty';
	let selectedCourse = 'empty';
	let selectedLocation = 'empty';
	let selectedClassroom = 'empty';
	let selectedPurpose = 'empty';
	let selectedBooking = 'empty';
	let title = '';
	let description = '';
	let weeks = 1;

	$: courseSaved = false;
	$: step1Criteria = title == '' || description == '' || selectedTeacher == 'empty';
	$: step2Criteria = selectedLocation == 'empty' || selectedClassroom == 'empty' || !courseSaved;
	$: locationSaved = false;
	$: bookingReadyForPreview = false;

	let teachers = [];
	$: courses = [];
	let locations = [];
	let purposes = [];
	let classrooms = [];
	$: filteredClassrooms = [];
	$: filteredPurposes = [];
	let bookings = [];
	let bookingDates = [];
	let checkedBookings = [];
	let bookingDate = [];
	let previousBookings = [];
	let allCourses = [];
	$: ignoreSetupTime = false;
	$: sortOrderDate = 'asc';
	$: sortOrderStatus = 'asc';
	$: showChangedColumn = checkedBookings.some((booking) => booking.changed);

	let courseStartDate;
	$: weekNumber = 0;

	let step1Data = {};
	let step2Data = {};

	$: {
		if (courseSaved) {
			if (
				step1Data.course_name != title ||
				step1Data.description != description ||
				step1Data.teacher_id != selectedTeacher
			) {
				courseSaved = false;
				locationSaved = false;
				bookingReadyForPreview = false;
			}
		}

		if (locationSaved) {
			if (
				step2Data.location_id != selectedLocation ||
				(step2Data.room_id != selectedClassroom) | (step2Data.purpose_id != selectedPurpose)
			) {
				locationSaved = false;
				bookingReadyForPreview = false;
			}
		}
	}

	function handlePreviousChange(event) {
		if (event.target.value === 'empty') {
			title = '';
			description = '';
			selectedTeacher = 'empty';
			selectedCourse = 'empty';
		} else {
			let course = previousBookings.find((c) => {
				return c.course_id == event.target.value;
			});
			title = course.course_name;
			description = course.description;
			selectedTeacher = course.teacher_id;
			selectedCourse = Number(event.target.value);
		}
	}

	function handlePurposeChange(event) {
		resetFilteredClassrooms();

		if (event.target.value !== 'empty') {
			selectedPurpose = Number(event.target.value);
			filteredClassrooms = filteredClassrooms.filter(
				(classroom) =>
					classroom.classroom_purpose && classroom.classroom_purpose.purpose_id === selectedPurpose
			);
		} else {
			selectedClassroom = 'empty';
		}
	}

	function handleDraftChange(event) {
		if (event.target.value === 'empty') {
			title = '';
			description = '';
			selectedTeacher = 'empty';
			selectedCourse = 'empty';
		} else {
			let course = courses.find((c) => {
				return c.course_id == Number(event.target.value);
			});
			title = course.course_name;
			description = course.description;
			selectedTeacher = course.teacher_id;
			selectedCourse = Number(event.target.value);
		}
	}

	function handleTeacherChange(event) {
		selectedTeacher = Number(event.target.value);
	}

	function handleLocationChange(event) {
		if (event.target.value === 'empty') {
			selectedLocation = 'empty';
			selectedClassroom = 'empty';
			selectedPurpose = 'empty';
			filteredPurposes = [];
		} else {
			selectedLocation = Number(event.target.value);
			resetFilteredClassrooms();
			filteredPurposes = purposes.filter((purpose) =>
				filteredClassrooms.some(
					(classroom) =>
						classroom.classroom_purpose &&
						classroom.classroom_purpose.purpose_id == purpose.purpose_id
				)
			);
			selectedClassroom = 'empty';
			selectedClassroom = 'empty';
		}
	}

	function resetFilteredClassrooms() {
		filteredClassrooms = classrooms.filter(
			(classroom) => classroom.location_id == selectedLocation
		);
	}

	function handleClassroomChange(event) {
		if (event.target.value === 'empty') {
			selectedClassroom = 'empty';
		} else {
			selectedClassroom = Number(event.target.value);
		}
	}

	async function saveDraft() {
		if (selectedCourse !== 'empty' && courses.some((c) => c.course_id == selectedCourse)) {
			try {
				const response = await fetch(`${$BASE_URL}/courses/${selectedCourse}`, {
					credentials: 'include',
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						course_id: selectedCourse,
						course_name: title,
						description,
						teacher_id: selectedTeacher
					})
				});

				if (response.ok) {
					const result = await response.json();

					courseSaved = true;

					//update the saved course info
					let course = courses.find((c) => {
						return c.course_id == selectedCourse;
					});
					course.course_name = title;
					course.description = description;
					course.teacher_id = selectedTeacher;
					step1Data = course;
					courses = courses;

					//open next formular
					courseSaved = true;
					locationSaved = false;
					bookingReadyForPreview = false;
				}
			} catch (error) {
				console.error(error);
			}
		} else {
			try {
				const response = await fetch(`${$BASE_URL}/courses`, {
					credentials: 'include',
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						course_name: title,
						description,
						teacher_id: selectedTeacher
					})
				});

				if (response.ok) {
					courseSaved = true;
					locationSaved = false;
					bookingReadyForPreview = false;
					step1Data.course_name = title;
					step1Data.description = description;
					step1Data.teacher_id = selectedTeacher;
					const result = await response.json();
					courses = [...courses, result.data];
					selectedCourse = result.data.course_id;
				} else {
					throw new Error(result.message || 'Oprettelse mislykkedes');
				}
			} catch (error) {
				console.error('Error creating course:', error);
				toast.error('Fejl ved at oprette event:', error.message);
			}
		}
	}

	function saveLocation() {
		locationSaved = true;
		bookingReadyForPreview = false;
		step2Data.location_id = selectedLocation;
		step2Data.room_id = selectedClassroom;
		step2Data.purpose_id = selectedPurpose;
	}

	$: selectedDays = [];

	$: days = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'].map((day) => ({
		name: day,
		startTime: '',
		endTime: '',
		selected: false,
		startDate: ''
	}));

	function deleteSingleBooking(bookingToBeDeleted) {
		checkedBookings = checkedBookings.filter((booking) => booking !== bookingToBeDeleted);
		checkedBookings = checkedBookings;
	}

	async function saveBooking() {
		checkedBookings = checkedBookings.map(
			({ conflict, newDate, newStartTime, newEndTime, ...rest }) => ({
				...rest,
				course_id: selectedCourse
			})
		);
		try {
			const response = await fetch(`${$BASE_URL}/bookings`, {
				credentials: 'include',
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(checkedBookings)
			});
			if (response.ok) {
				toast.success(
					`Booking oprettet på ${title} med ${checkedBookings.length} datoer over ${weeks} ${
						weeks > 1 ? 'uger' : 'uge'
					}`,
					{ duration: 7000 }
				);
				initializeData();
			}
		} catch (error) {
			console.error('Error saving booking:', error);
		}
	}

	async function checkBookingDates(includeDays) {
		if (weeks < 1) {
			weeks = 1;
		}
		//filter the selected days off and then map all the selected days * weeks into potential booking dates
		if (includeDays) {
			bookingDates = days
				.filter((day) => day.selected)
				.map((day) => {
					let bookings = [];
					let startDate = new Date(day.startDate);
					for (let i = 0; i < weeks; i++) {
						let booking = {
							course_id: step1Data.course_id,
							room_id: step2Data.room_id,
							startTime: day.startTime,
							endTime: day.endTime,
							date: new Date(startDate)
						};
						startDate.setDate(startDate.getDate() + 7);
						bookings.push(booking);
					}
					return bookings;
				})
				.flat();
		}

		let allStartDatesBeforeEndDates = bookingDates.every(
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
				body: JSON.stringify({ bookingDates, ignoreSetupTime })
			});

			if (response.ok) {
				const result = await response.json();
				checkedBookings = result.data.map((booking) => ({
					...booking,
					date: new Date(booking.date)
				}));
				sortCheckedBookingByDate();
				bookingReadyForPreview = true;
			}
		} catch (error) {
			console.error('Error saving booking:', error);
		}
	}

	async function checkNewDateAndTime(bookingToCheck) {

		if (bookingToCheck.newDate < new Date().toISOString().split('T')[0]) {
			toast.error('Datoen kan ikke være før i dag', { duration: 5000 });
			return;
		}

		if (bookingToCheck.newStartTime >= bookingToCheck.newEndTime) {
			toast.error('Starttidspunkt skal være før sluttidspunkt', { duration: 5000 });
			return;
		}

		let theBooking = bookingDates.find((booking) => {
			// Check if the booking date and time matches the bookingToCheck date and time
			if (
				booking.date.toISOString() === bookingToCheck.date.toISOString() &&
				booking.startTime === bookingToCheck.startTime &&
				booking.endTime === bookingToCheck.endTime
			) {
				booking.date = new Date(bookingToCheck.newDate);
				booking.startTime = bookingToCheck.newStartTime;
				booking.endTime = bookingToCheck.newEndTime;
				return booking;
			}

		});

		bookingDate = [theBooking];
		try {
			const response = await fetch(`${$BASE_URL}/check-booking-dates`, {
				credentials: 'include',
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ bookingDates: bookingDate, ignoreSetupTime })
			});

			if (response.ok) {
				const result = await response.json();

				bookingDate = result.data.map((booking) => ({
					...booking,
					date: new Date(booking.date),
					changed: true
				}));

				checkedBookings = checkedBookings.map((checkedBooking) => {
					if (
						checkedBooking.date.toDateString() === bookingToCheck.date.toDateString() &&
						checkedBooking.startTime === bookingToCheck.startTime &&
						checkedBooking.endTime === bookingToCheck.endTime
					) {
						return bookingDate[0];
					} else {
						return checkedBooking;
					}
				});
			}
		} catch (error) {
			console.error('Error saving booking:', error);
		}
	}

	function toggleDay(day) {
		if (day.selected) {
			selectedDays.push(day);
			selectedDays = selectedDays;
		} else {
			day.startTime = '';
			day.endTime = '';
			days = days;
			selectedDays = selectedDays.filter((d) => d.name !== day.name);
		}
		bookingReadyForPreview = false;
	}

	function updateStartTime(day, event) {
		day.startTime = event.target.value;
		selectedDays = selectedDays;
	}

	function updateEndTime(day, event) {
		day.endTime = event.target.value;
		selectedDays = selectedDays;
	}

	function updateStartDate(day, event) {
		day.startDate = event.target.value;
		selectedDays = selectedDays;
	}

	function updateStartDates(event) {
		weekNumber = getWeekNumber(new Date(event.target.value));

		courseStartDate = new Date(event.target.value);

		// Get the day of the week (0 for Sunday, 1 for Monday, etc.)
		let dayOfWeek = courseStartDate.getDay();

		// If the day of the week is 0 (Sunday), set it to 7
		if (dayOfWeek === 0) dayOfWeek = 7;

		// Subtract the day of the week from the date to get the Monday of the week
		courseStartDate.setDate(courseStartDate.getDate() - dayOfWeek + 1);

		days.forEach((day) => {
			let date = `${courseStartDate.getFullYear()}-${(courseStartDate.getMonth() + 1).toString().padStart(2, '0')}-${courseStartDate.getDate().toString().padStart(2, '0')}`;
			day.startDate = date;
			courseStartDate.setDate(courseStartDate.getDate() + 1);
		});
		days = days;
	}

	$: AllInfoIsGiven = false;

	$: if (selectedDays.length >= 1 && locationSaved && courseSaved) {
		let allInfo = true;
		for (let day of selectedDays) {
			if (day.startTime == '' || day.endTime == '' || day.startDate == '') {
				allInfo = false;
			}
		}
		AllInfoIsGiven = allInfo;
	} else {
		AllInfoIsGiven = false;
	}

	function initializeData() {
		checkedBookings = [];
		bookingReadyForPreview = false;
		locationSaved = false;
		courseSaved = false;
		title = '';
		description = '';
		selectedTeacher = 'empty';
		selectedCourse = 'empty';
		selectedLocation = 'empty';
		selectedClassroom = 'empty';
		selectedBooking = 'empty';
		weeks = 1;
		courses = [];
		locations = [];
		classrooms = [];
		filteredClassrooms = [];
		bookings = [];
		step1Data = {};
		step2Data = {};
		ignoreSetupTime = false;
		sortOrderDate = 'asc';
		sortOrderStatus = 'asc';
		selectedDays = [];
		days = days.map((day) => ({
			...day,
			startTime: '',
			endTime: '',
			selected: false,
			startDate: ''
		}));
	}

	// Copied from Copilot
	function getWeekNumber(d) {
		let date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
		date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
		let yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
		let weekNumber = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
		return weekNumber;
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
		checkedBookings = checkedBookings;
	}

	function sortCheckedBookingByDate() {
		checkedBookings = checkedBookings.sort((a, b) => {
			let dateA = new Date(a.date),
				dateB = new Date(b.date);
			return sortOrderDate === 'asc' ? dateA - dateB : dateB - dateA;
		});
		sortOrderDate = sortOrderDate === 'asc' ? 'desc' : 'asc';
		checkedBookings = checkedBookings;
	}
</script>

<h2>Booking</h2>

<div class="border border-2 p-3 m-3">
	<p><strong>Trin 1</strong></p>
	<SelectBoxOptions
		label={'Kopier fra tidligere oprettet booking'}
		selected={selectedCourse}
		idKey={'course_id'}
		optionName={'course_name'}
		options={previousBookings}
		onOptionChange={handlePreviousChange}
	/>
	<SelectBoxOptions
		label={'Fortsæt tidligere booking kladde (Kurser der ikke er blevet booket færdig)'}
		selected={selectedCourse}
		idKey={'course_id'}
		optionName={'course_name'}
		options={courses}
		onOptionChange={handleDraftChange}
	/>
	<form on:submit|preventDefault={saveDraft} class="needs-validation">
		<label for="title">Titel</label>
		<input type="text" id="title" class="form-control" bind:value={title} />
		<label for="title">Beskrivelse</label>
		<textarea type="text" id="description" class="form-control" bind:value={description} />

		<SelectBoxOptions
			label={'Vælg underviser'}
			selected={selectedTeacher}
			idKey={'teacher_id'}
			optionName={'email'}
			options={teachers}
			onOptionChange={handleTeacherChange}
		/>
		<button
			type="submit"
			class="btn {courseSaved ? 'btn-success' : 'btn-primary'}"
			disabled={step1Criteria}
			>{courseSaved ? 'Ok' : 'Bekræft'}
		</button>
	</form>
</div>

<div class="border border-2 p-3 m-3">
	<p><strong>Trin 2</strong></p>
	<SelectBoxOptions
		label={'Vælg afdeling'}
		selected={selectedLocation}
		idKey={'location_id'}
		optionName={'school_name'}
		options={locations}
		onOptionChange={handleLocationChange}
	/>

	<SelectBoxOptions
		label={'Vælg formål'}
		selected={selectedPurpose}
		idKey={'purpose_id'}
		optionName={'purpose'}
		options={filteredPurposes}
		onOptionChange={handlePurposeChange}
	/>

	<SelectBoxOptions
		label={'Vælg lokale'}
		selected={selectedClassroom}
		idKey={'room_id'}
		optionName={'room_name'}
		options={filteredClassrooms}
		onOptionChange={handleClassroomChange}
	/>
	<button
		on:click={saveLocation}
		type="button"
		class="btn {locationSaved ? 'btn-success' : 'btn-primary'}"
		disabled={step2Criteria}>{locationSaved ? 'OK' : 'Bekræft'}</button
	>
</div>

<div class="border border-2 p-3 m-3">
	<p><strong>Trin 3</strong></p>
	<form on:submit|preventDefault={() => checkBookingDates(true)}>
		<div class="mb-3">
			<label for="weeks" class="form-label">Antal uger:</label>
			<input type="number" id="weeks" name="weeks" class="form-control" bind:value={weeks} />
		</div>
		<div class="mb-3">
			<label for="startdate" class="form-label">Vælg en dato fra startugen:</label>
			<input
				type="date"
				min={new Date().toISOString().split('T')[0]}
				id="startdate"
				name="startdate"
				class="form-control"
				on:change={updateStartDates}
			/>
		</div>
		<div class="mb-3">
			<div class="d-flex align-content-center gap-2">
				<label for="setup-time" class="form-label">Ignorér klargøringstid (15 minutter):</label>
				<div class="form-check form-check-inline">
					<input
						class="form-check-input border-3 p-2 rounded"
						type="checkbox"
						id={'setup-time'}
						bind:checked={ignoreSetupTime}
					/>
				</div>
			</div>

			{#if weekNumber > 0 && new Date(courseStartDate) > new Date()}
				<p>
					Du har valgt <b>uge {weekNumber}</b> som startuge. Vælg en ny dato for at ændre startugen.
				</p>
			{/if}

			{#if new Date(courseStartDate) > new Date()}
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
									<td
										><input
											type="checkbox"
											bind:checked={day.selected}
											on:change={() => toggleDay(day)}
										/></td
									>
									<td>{day.name}</td>
									<td
										><input
											type="time"
											step="900"
											bind:value={day.startTime}
											on:change={(event) => updateStartTime(day, event)}
										/></td
									>
									<td
										><input
											type="time"
											step="900"
											bind:value={day.endTime}
											on:change={(event) => updateEndTime(day, event)}
										/></td
									>
									<td
										><input
											type="date"
											min={new Date().toISOString().split('T')[0]}
											bind:value={day.startDate}
											on:change={(event) => updateStartDate(day, event)}
										/></td
									>
								</tr>
							{/if}
						{/each}
					</tbody>
				</table>
			{/if}
			<button
				type="submit"
				class="btn {bookingReadyForPreview && checkedBookings.length > 0
					? 'btn-success'
					: 'btn-primary'}"
				disabled={!AllInfoIsGiven}
				>{bookingReadyForPreview && checkedBookings.length > 0 ? 'Ok' : 'Anmod booking'}</button
			>
		</div>
	</form>
</div>
{#if bookingReadyForPreview && checkedBookings.length > 0}
	<div class="border border-2 p-3 m-3">
		<p><strong>Trin 4</strong></p>
		<table class="table">
			<thead>
				<tr>
					<th scope="col" class="sortable" on:click={sortCheckedBookingByDate}>
						Dato {sortOrderDate === 'asc' ? '▲' : '▼'}
					</th>
					<th scope="col">Starttidspunkt</th>
					<th scope="col">Sluttidspunkt</th>
					<th scope="col" class="sortable" on:click={sortCheckedBookingByConflict}>
						Status {sortOrderStatus === 'asc' ? '▲' : '▼'}
					</th>
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
								booking.date
									.toLocaleDateString('da-DK', { weekday: 'long' })
									.slice(1)
									.toLowerCase()}
							{booking.date.getDate()}/{booking.date.getMonth() +
								1}/{booking.date.getFullYear()}</td
						>
						<td>{booking.startTime}</td>
						<td>{booking.endTime}</td>
						<td>
							{#if booking.holidayConflict}
								<div>
									Lukket - {booking.holidayConflict.name},
									{new Date(booking.holidayConflict.start_date).toLocaleDateString()} -
									{new Date(booking.holidayConflict.end_date).toLocaleDateString()}
								</div>
							{:else if booking.conflict}
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
								on:click={() => {
									checkNewDateAndTime(booking);
								}}
								disabled={!booking.newDate || !booking.newStartTime || !booking.newEndTime}
								>Tjek</button
							>
						</td>
						{#if showChangedColumn}
							<td>{booking.changed ? 'Ændret tidspunkt' : ''}</td>
						{/if}
						<td>
							<button class="btn" on:click={() => deleteSingleBooking(booking)}>
								<i class="bi bi-trash-fill"></i>
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
		<button
			class="btn btn-primary"
			on:click={saveBooking}
			disabled={!bookingReadyForPreview ||
				!checkedBookings.every((booking) => !booking.conflict) ||
				!checkedBookings.length}>Færdiggør booking</button
		>
	</div>
{/if}

<Toaster />

<style>
	.sortable:hover {
		cursor: pointer;
	}
</style>
