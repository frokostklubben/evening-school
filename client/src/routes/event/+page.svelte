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

	let selectedTeacher = 'empty';
	let selectedCourse = 'empty';
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
		console.log(">>>>>>>>>>>>>>>>>>>>>", event.target.value === "empty");
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
			console.log(">>>>>>>>>>>> teacher id type",typeof course.teacher_id);
			selectedCourse = Number(event.target.value)
			console.log(">>>>>>>>>>>> selected course id type",typeof event.target.value);

		}
	}

	function handleTeacherChange(event) {
		selectedTeacher = event.target.value;
	}

	async function saveDraft() {
		if (selectedCourse !== '') {
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
					//open next formular
					console.log('PATCH - Success! Open next formular');
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
					console.log("POST - Success! Open next formular");
				} else {
					throw new Error(result.message || 'Oprettelse mislykkedes');
				}
			} catch (error) {
				console.error('Error creating course:', error);
				toast.error('Fejl ved at oprette event:', error.message);
			}
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
			class="btn btn-primary"
			disabled={title == '' || description == '' || selectedTeacher == 'empty'}>Fortsæt</button
		>
	</form>
</div>

<div class="border border-2 p-3 m-3">
	<p><strong>Trin 2</strong></p>
	<SelectBoxOptions
		label={'Vælg afdeling'}
		selected={""}
		idKey={'teacher_id'}
		optionName={'email'}
		options={teachers}
		onOptionChange={handleOptionChange}
	/>
	<SelectBoxOptions
		label={'Vælg lokale'}
		selected={''}
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
