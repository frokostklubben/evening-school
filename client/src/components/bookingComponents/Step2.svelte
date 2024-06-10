<script>
	import { onMount } from 'svelte';
	import SelectBoxOptions from '../../components/SelectBoxOptions.svelte';
	import { BASE_URL } from '../../stores/apiConfig.js';
	import { toast } from 'svelte-french-toast';

	export let selectedLocation = 'empty';
	export let selectedPurpose = 'empty';
	export let selectedClassroom = 'empty';

	let locations = [];
	let purposes = [];
	let classrooms = [];
	let filteredPurposes = [];
	let filteredClassrooms = [];

	onMount(async () => {
		try {
			const response = await fetch(`${$BASE_URL}/booking-form-info`, {
				credentials: 'include'
			});

			if (response.ok) {
				const result = await response.json();
				locations = result.data.locations;
				purposes = result.data.classrooms
					.map((classroom) => classroom.classroom_purpose)
					.filter((purpose) => purpose !== null);
				classrooms = result.data.classrooms;

				let purposeMap = new Map();
				purposes.forEach((obj) => {
					purposeMap.set(obj.purpose_id, obj);
				});
				purposes = Array.from(purposeMap.values());
			}
		} catch (error) {
			console.error('Error fetching booking form info:', error);
			toast.error('Error fetching booking form info');
		}
	});

	function handleLocationChange(event) {
		selectedLocation = Number(event.target.value);
		resetFilteredClassrooms();
		filteredPurposes = purposes.filter((purpose) =>
			classrooms.some(
				(classroom) =>
					classroom.classroom_purpose &&
					classroom.classroom_purpose.purpose_id == purpose.purpose_id &&
					classroom.location_id == selectedLocation
			)
		);
		selectedPurpose = 'empty';
		selectedClassroom = 'empty';
	}

	function handlePurposeChange(event) {
		if (event.target.value === 'empty') {
			selectedPurpose = 'empty';
			selectedClassroom = 'empty';
			filteredClassrooms = [];
		} else {
			selectedPurpose = Number(event.target.value);
			filteredClassrooms = classrooms.filter(
				(classroom) =>
					classroom.classroom_purpose &&
					classroom.classroom_purpose.purpose_id === selectedPurpose &&
					classroom.location_id === selectedLocation
			);
			selectedClassroom = 'empty';
		}
	}

	function handleClassroomChange(event) {
		selectedClassroom = Number(event.target.value);
	}

	function resetFilteredClassrooms() {
		filteredClassrooms = classrooms.filter(
			(classroom) => classroom.location_id == selectedLocation
		);
	}
</script>

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
</div>
