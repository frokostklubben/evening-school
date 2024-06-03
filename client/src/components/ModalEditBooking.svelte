<script>
	import { Button, Modal } from 'flowbite-svelte';
	import { toast, Toaster } from 'svelte-french-toast';
	import { BASE_URL } from '../stores/apiConfig.js';
	import { selectedItem, showEditModal, editData } from '../stores/modalStore.js';
	import { itemList } from '../stores/itemListStore.js';
	import { displayNames } from '../stores/dictionaryStore.js';
	import SelectBoxOptions from './SelectBoxOptions.svelte';

	let itemKeys = [];
	let idKey = 'bookingId';
	$: teachers = $editData.teachers;
	$: locations = $editData.locations;
	$: classrooms = $editData.locations
		? $editData.locations.map((location) => location.Classrooms).flat()
		: [];

console.log('selectedItem', $selectedItem);
    //let selectedTeacher = $selectedItem.teacherId;
    $: selectedTeacher = $selectedItem.teacherId;
    $: selectedClassroom = $selectedItem.roomId;
	$: selectedLocation = $selectedItem.locationId;

	$: filteredClassrooms = selectedLocation
		? classrooms.filter((classroom) => classroom.location_id == selectedLocation)
		: classrooms;

	$: {
		if ($selectedItem) {
			itemKeys = Object.keys($selectedItem).filter((key) => !key.endsWith('_id'));
		}
	}

	async function saveChanges() {
		try {
			const response = await fetch(`${$BASE_URL}/bookings/${$selectedItem[idKey]}`, {
				credentials: 'include',
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify($selectedItem)
			});

			const result = await response.json();
			if (response.ok) {
				toast.success('Opdatering vellykket!');

				const index = $itemList.findIndex((item) => item[idKey] === $selectedItem[idKey]);
				if (index !== -1) {
					$itemList[index] = $selectedItem;
				}

				showEditModal.set(false);
			} else {
				toast.error('Fejl ved opdatering:', error.message);
			}
		} catch (error) {
			toast.error('Fejl ved opdatering:', error.message);
		}
	}

	function handleLocationChange(event) {
        selectedLocation = Number(event.target.value)
    }

	function handleClassroomChange(event) {
        selectedClassroom = Number(event.target.value)
	}

	function handleTeacherChange(event) {
        selectedTeacher = Number(event.target.value)
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
				</form>
			</div>
		</div>
	</div>

	<svelte:fragment slot="footer">
		<div class="container">
			<div class="text-center">
				<Button class="me-2" type="submit" color="green" on:click={saveChanges}>Gem</Button>
				<Button color="red">Afbryd</Button>
			</div>
		</div>
	</svelte:fragment>
</Modal>

<Toaster />
