<script>
	import { onMount } from 'svelte';
	import SelectBoxOptions from '../../components/SelectBoxOptions.svelte';
	import { BASE_URL } from '../../stores/apiConfig.js';

	let courses = [];

	onMount(async () => {
		try {
			const response = await fetch(`${$BASE_URL}/booking-form-info`, {
				credentials: 'include'
			});

			if (response.ok) {
				const result = await response.json();
				teachers = result.data.teachers;
				courses = result.data.courses;
			}
		} catch (error) {
			console.error(error);
		}
	});

	let selectedTeacher = '';
	let selectedCourse;
	let selectedLocation = '';
	let selectedClassroom = '';

	let teachers = [];

	function saveChanges() {
		console.log('saved');
	}

	function handleOptionChange() {}

	let title = '';
	let description = '';
	function handleDraftChange(event) {
		if (event.target.value === 'empty') {
			title = ''
			description = ''
			selectedTeacher = 'empty'
		} else {
			let course = courses.find((c) => {
				return c.course_id == event.target.value;
			});
			title = course.course_name;
			description = course.description;
			selectedTeacher = course.teacher_id;
		}
	}
</script>

<h2>Event/foredrag</h2>

<div class="border border-2 p-3 m-3">
	<p><strong>Trin 1</strong></p>
	<SelectBoxOptions
		label={'Kopier fra tidligere oprettet booking'}
		selected={selectedTeacher}
		idKey={'teacher_id'}
		optionName={'email'}
		options={teachers}
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
	<form on:submit|preventDefault={saveChanges} class="needs-validation">
		<label for="title">Titel</label>
		<input type="text" id="title" class="form-control" bind:value={title} required />
		<label for="title">Beskrivelse</label>
		<textarea type="text" id="description" class="form-control" bind:value={description} required />

		<SelectBoxOptions
			label={'Vælg underviser'}
			selected={selectedTeacher}
			idKey={'teacher_id'}
			optionName={'email'}
			options={teachers}
			onOptionChange={handleOptionChange}
		/>
		<button type="submit" class="btn btn-primary">Fortsæt</button>
	</form>
</div>

<div class="border border-2 p-3 m-3">
	<p><strong>Trin 2</strong></p>
	<SelectBoxOptions
		label={'Vælg afdeling'}
		selected={selectedTeacher}
		idKey={'teacher_id'}
		optionName={'email'}
		options={teachers}
		onOptionChange={handleOptionChange}
	/>
	<SelectBoxOptions
		label={'Vælg lokale'}
		selected={selectedTeacher}
		idKey={'teacher_id'}
		optionName={'email'}
		options={teachers}
		onOptionChange={handleOptionChange}
	/>
	<button type="button" class="btn btn-primary">forsæt</button>
</div>

<div class="border border-2 p-3 m-3">
	<p><strong>Trin 3</strong></p>
</div>
