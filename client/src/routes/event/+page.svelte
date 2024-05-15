<script>
	import { onMount } from 'svelte';
	import SelectBoxOptions from '../../components/SelectBoxOptions.svelte';
	import { BASE_URL } from '../../stores/apiConfig.js';

	onMount(async () => {
		try {
			const response = await fetch(`${$BASE_URL}/booking-form-info`, {
				credentials: 'include'
			});

			if (response.ok) {
				const result = await response.json();
				teachers = result.data.teachers;
				courses = result.data.courses;
				locations = result.data.locations;
				classrooms = result.data.classrooms;
			}
		} catch (error) {
			console.error(error);
		}
	});

	let selectedTeacher = 'empty';
	let selectedCourse = 'empty';
	let selectedLocation = 'empty';
	let selectedClassroom = 'empty';
	let selectedBooking = 'empty';
	let title = '';
	let description = '';
	let weeks = 1;

	$: courseSaved = false;
	$: step1Criteria = title == '' || description == '' || selectedTeacher == 'empty';
	$: step2Criteria = selectedLocation == 'empty' || selectedClassroom == 'empty' || !courseSaved;
	$: locationSaved = false;

	let teachers = [];
	$: courses = [];
	let locations = [];
	let classrooms = [];
	$: filteredClassrooms = [];
	let bookings = [];

	let step1Data = {};
	let step2Data = {};
	let step3Data = {};

	$: {
		if (courseSaved) {
			if (
				step1Data.course_name != title ||
				step1Data.description != description ||
				step1Data.teacher_id != selectedTeacher
			) {
				courseSaved = false;
				locationSaved = false;
			}
		}

		if (locationSaved) {
			if (step2Data.location_id != selectedLocation || step2Data.room_id != selectedClassroom) {
				locationSaved = false;
			}
		}
	}

	function handleOptionChange() {}

	function handleDraftChange(event) {
		if (event.target.value === 'empty') {
			title = '';
			description = '';
			selectedTeacher = 'empty';
			selectedCourse = 'empty';
		} else {
			let course = courses.find((c) => {
				return c.course_id == event.target.value;
			});
			title = course.course_name;
			description = course.description;
			selectedTeacher = course.teacher_id;
			selectedCourse = Number(event.target.value);
		}
	}

	function handleTeacherChange(event) {
		selectedTeacher = event.target.value;
	}

	function handleLocationChange(event) {
		if (event.target.value === 'empty') {
			selectedLocation = 'empty';
			selectedClassroom = 'empty';
		} else {
			selectedLocation = Number(event.target.value);
			filteredClassrooms = classrooms.filter(
				(classroom) => classroom.location_id == selectedLocation
			);
		}
	}

	function handleClassroomChange(event) {
		if (event.target.value === 'empty') {
			selectedClassroom = 'empty';
		} else {
			selectedClassroom = Number(event.target.value);
		}
	}

	async function saveDraft() {
		if (selectedCourse !== 'empty') {
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

					//this makes the list updated in the selectbox
					courses = courses;

					//open next formular
					courseSaved = true;
					locationSaved = false;
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
					form1Data.course_name = title;
					form1Data.description = description;
					form1Data.teacher_id = selectedTeacher;
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
		step2Data.location_id = selectedLocation;
		step2Data.room_id = selectedClassroom;
	}

	$: selectedDays = [];

	$: days = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'].map((day) => ({
		name: day,
		startTime: '',
		endTime: '',
		selected: false,
		startDate: ''
	}));

	async function saveBooking() {
		const bookingData = {
			course_id: step1Data.course_id,
			room_id: step2Data.room_id,
			days: days
				.filter((day) => day.startTime && day.endTime && day.startDate)
				.map((day) => ({
					startTime: day.startTime,
					endTime: day.endTime,
					date: day.startDate
				}))
		};

		try {
			const response = await fetch(`${$BASE_URL}/bookings`, {
				credentials: 'include',
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(bookingData)
			});
			const result = await response.json();

			console.log(result);
		} catch (error) {
			console.error('Error saving booking:', error);
		}
	}

	async function checkBookingDates() {
		let bookingDates = [];

		if (weeks < 1) {
			weeks = 1;
		}
		//filter the selected days off and then map all the selected days * weeks into potential booking dates
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

		try {
			const response = await fetch(`${$BASE_URL}/check-booking-dates`, {
				credentials: 'include',
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(bookingDates)
			});
			const result = await response.json();

			console.log(result);
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
			days = days
			selectedDays = selectedDays.filter((d) => d.name !== day.name);
		}
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
		let courseStartDate = new Date(event.target.value);

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
		//update days
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

		console.log('checking info');
		AllInfoIsGiven = allInfo;
	} else {
		AllInfoIsGiven = false;
	}
</script>

<h2>Event/foredrag</h2>

<div class="border border-2 p-3 m-3">
	<p><strong>Trin 1</strong></p>
	<SelectBoxOptions
		label={'Kopier fra tidligere oprettet booking'}
		selected={selectedBooking}
		idKey={'booking_id'}
		optionName={'course_id'}
		options={bookings}
		onOptionChange={handleOptionChange}
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
		optionName={'street_name'}
		options={locations}
		onOptionChange={handleLocationChange}
	/>
	<div class="mb-2">Formål?</div>

	<SelectBoxOptions
		label={'Vælg lokale'}
		selected={selectedClassroom}
		idKey={'room_id'}
		optionName={'room_id'}
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
	<form on:submit|preventDefault={checkBookingDates}>
		<div class="mb-3">
			<label for="weeks" class="form-label">Antal gange:</label>
			<input type="number" id="weeks" name="weeks" class="form-control" bind:value={weeks} />
		</div>
		<div class="mb-3">
			<label for="startdate" class="form-label">Vælg en dato fra startugen:</label>
			<input
				type="date"
				id="startdate"
				name="startdate"
				class="form-control"
				value="2024-05-20"
				on:change={updateStartDates}
			/>
		</div>
		<p>`Du har valgt uge: x (ugedage xx/xx/xxxx - xx/xx/xxxx)`</p>
		<table class="table">
			<thead>
				<tr>
					<th scope="col">Vælg</th>
					<th scope="col">Dag</th>
					<th scope="col">Start Time</th>
					<th scope="col">End Time</th>
					<th scope="col">Start dato </th>
				</tr>
			</thead>
			<tbody>
				{#each days as day (day.name)}
					<tr>
						<td
							><input
								type="checkbox"
								id={day.name}
								name={day.name}
								bind:checked={day.selected}
								on:change={() => toggleDay(day)}
							/></td
						>
						<td>{day.name}</td>
						<td
							><input
								type="time"
								id={`start-${day.name}`}
								name={`start-${day.name}`}
								bind:value={day.startTime}
								on:change={(event) => updateStartTime(day, event)}
							/></td
						>
						<td
							><input
								type="time"
								id={`end-${day.name}`}
								name={`end-${day.name}`}
								bind:value={day.endTime}
								on:change={(event) => updateEndTime(day, event)}
							/></td
						>
						<td
							><input
								type="date"
								id={`date-${day.name}`}
								name={`date-${day.name}`}
								bind:value={day.startDate}
								on:change={(event) => updateStartDate(day, event)}
							/></td
						>
					</tr>
				{/each}
			</tbody>
		</table>
		<button type="submit" class="btn btn-primary" disabled={!AllInfoIsGiven}>Anmod booking</button>
	</form>
</div>
<div class="border border-2 p-3 m-3">
	<p><strong>Trin 4</strong></p>
</div>
