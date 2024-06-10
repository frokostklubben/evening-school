<script>
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { toast, Toaster } from 'svelte-french-toast';
	import Step1 from '../../components/bookingComponents/Step1.svelte';
	import Step2 from '../../components/bookingComponents/Step2.svelte';
	import Step3 from '../../components/bookingComponents/Step3.svelte';
	import { fetchBookingFormInfo, checkBookingDates } from '../../services/bookingService.js';
	import { allInfoGiven } from '../../stores/bookingStore';

	let title = '';
	let description = '';
	let selectedTeacher = 'empty';
	let selectedCourse = 'empty';
	let selectedLocation = 'empty';
	let selectedPurpose = 'empty';
	let selectedClassroom = 'empty';
	let weeks = 1;
	let selectedDays = [];
	let ignoreSetupTime = false;
	let courseStartDate = null;

	let teachers = [];
	let courses = [];
	let previousBookings = [];
	let locations = [];
	let purposes = [];
	let classrooms = [];

	const currentStep = writable(1);
	const maxStep = 4;
	//	const allInfoGiven = writable(false);

	onMount(fetchFormInfo);

	function handleSaveDraft() {
		nextStep();
	}

	function nextStep() {
		currentStep.update((n) => Math.min(n + 1, maxStep));
	}

	function prevStep() {
		currentStep.update((n) => Math.max(n - 1, 1));
	}

	async function fetchFormInfo() {
		try {
			const result = await fetchBookingFormInfo();
			teachers = result.data.teachers;
			courses = result.data.coursesWithoutBooking;
			locations = result.data.locations;
			classrooms = result.data.classrooms;

			let allCourses = result.data.courses;
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
		} catch (error) {
			console.error('Error fetching booking form info:', error);
			toast.error('Error fetching booking form info');
		}
	}

	async function handleCheckBookingDates() {
		try {
			if (!selectedDays.length) {
				toast.error('Please select at least one day.');
				return;
			}

			const result = await checkBookingDates({ weeks, selectedDays, ignoreSetupTime });
			console.log('result.data:', result.data); // Handle the result as needed
			nextStep();
		} catch (error) {
			toast.error('Error checking booking dates');
		}
	}
</script>

<Toaster />

<div class="container">
	{#if $currentStep === 1}
		<Step1
			bind:title
			bind:description
			{teachers}
			{previousBookings}
			{courses}
			bind:selectedTeacher
			bind:selectedCourse
			onSaveDraft={handleSaveDraft}
		/>
	{/if}
	{#if $currentStep === 2}
		<Step2
			{locations}
			{purposes}
			{classrooms}
			bind:selectedLocation
			bind:selectedPurpose
			bind:selectedClassroom
			onSelectionChange={handleSaveDraft}
		/>
	{/if}
	{#if $currentStep === 3}
		<Step3 bind:weeks bind:selectedDays bind:ignoreSetupTime bind:courseStartDate {allInfoGiven} />
	{/if}
	{#if $currentStep === 4}
		<!-- Step4 component -->
	{/if}

	<div class="d-flex justify-content-between mt-3">
		{#if $currentStep > 1}
			<button class="btn btn-secondary" on:click={prevStep}>Previous</button>
		{/if}
		{#if $currentStep === 3}
			<button class="btn btn-primary" on:click={handleCheckBookingDates} disabled={!$allInfoGiven}>
				Anmod booking
			</button>
		{/if}
		{#if $currentStep < maxStep && $currentStep !== 3}
			<button class="btn btn-primary" on:click={nextStep}>Next</button>
		{/if}
	</div>
</div>
