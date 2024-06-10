<script>
	import { onMount } from 'svelte';
	import SelectBoxOptions from '../../components/SelectBoxOptions.svelte';
	import { BASE_URL } from '../../stores/apiConfig.js';
	import { saveDraft } from '../../services/bookingService.js';
	import { toast } from 'svelte-french-toast';

	export let title = '';
	export let description = '';
	export let selectedTeacher = 'empty';
	export let selectedCourse = 'empty';
	export let onSaveDraft;

	let teachers = [];
	let courses = [];
	let previousBookings = [];

	let step1Criteria = true;

	$: step1Criteria = title == '' || description == '' || selectedTeacher == 'empty';

	onMount(async () => {
		try {
			const response = await fetch(`${$BASE_URL}/booking-form-info`, {
				credentials: 'include'
			});

			if (response.ok) {
				const result = await response.json();
				teachers = result.data.teachers;
				courses = result.data.coursesWithoutBooking;

				let allCourses = result.data.courses;
				let filteredBookings = result.data.filteredBookings;
				previousBookings = allCourses.filter((course) => {
					return filteredBookings.some(
						(booking) => Number(booking.course_id) === Number(course.course_id)
					);
				});
			}
		} catch (error) {
			console.error('Error fetching booking form info:', error);
			toast.error('Error fetching booking form info');
		}
	});

	function handlePreviousChange(event) {
		if (event.target.value === 'empty') {
			title = '';
			description = '';
			selectedTeacher = 'empty';
			selectedCourse = 'empty';
		} else {
			let course = previousBookings.find((c) => c.course_id == event.target.value);
			title = course.course_name;
			description = course.description;
			selectedTeacher = course.teacher_id;
			selectedCourse = Number(event.target.value);
		}
	}

	function handleDraftChange(event) {
		if (event.target.value === 'empty') {
			title = '';
			description = '';
			selectedTeacher = 'empty';
			selectedCourse = 'empty';
		} else {
			let course = courses.find((c) => c.course_id == Number(event.target.value));
			title = course.course_name;
			description = course.description;
			selectedTeacher = course.teacher_id;
			selectedCourse = Number(event.target.value);
		}
	}

	function handleTeacherChange(event) {
		selectedTeacher = Number(event.target.value);
	}

	async function saveDraftHandler() {
		try {
			const course = {
				course_id: selectedCourse,
				course_name: title,
				description,
				teacher_id: selectedTeacher
			};
			await saveDraft(course);
			toast.success('Draft saved successfully');
			onSaveDraft(); // Notify the parent component that the draft has been saved
		} catch (error) {
			toast.error('Failed to save draft');
		}
	}
</script>

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
	<form on:submit|preventDefault={saveDraftHandler}>
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
	</form>
</div>
