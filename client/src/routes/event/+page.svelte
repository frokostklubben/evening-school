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

	let step1Data = {}
	let step2Data = {}

	$: {
		if (courseSaved) {
			if (step1Data.course_name != title || step1Data.description != description || step1Data.teacher_id != selectedTeacher){
			courseSaved = false;
			locationSaved = false;
			}
		}

		if (locationSaved) {
			if (step2Data.location_id != selectedLocation || step2Data.room_id != selectedClassroom){
				locationSaved = false;
			}
		}
	}

	function saveChanges() {
		console.log('saved');
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
			filteredClassrooms = classrooms.filter((classroom)  => classroom.location_id == selectedLocation)
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
					return c.course_id == selectedCourse
					});
					course.course_name = title;
					course.description = description;
					course.teacher_id = selectedTeacher

					step1Data = course

					//this makes the list updated in the selectbox
					courses = courses
					
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
					form1Data.course_name = title
					form1Data.description = description
					form1Data.teacher_id = selectedTeacher
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
		locationSaved = true
		step2Data.location_id = selectedLocation
		step2Data.room_id = selectedClassroom
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
			disabled={step1Criteria}>{courseSaved ? 'Ok' : 'Bekræft'}
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
	<div class="mb-2"> Formål? </div>

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
</div>
