<script>
	import ModalDelete from '../../components/ModalDelete.svelte';
	import { derived } from 'svelte/store';
	import { headerKeys, headerKeysDanish, itemList } from '../../stores/itemListStore.js';
	import { optionId, selectedItem, showDeleteModal, showEditModal	} from '../../stores/modalStore.js';
	import { displayNames } from '../../stores/dictionaryStore.js';
	import { BASE_URL } from '../../stores/apiConfig.js';
	import { onMount } from 'svelte';
	import SelectBoxOptions from '../../components/SelectBoxOptions.svelte';

	let collection = 'bookings';
	let idKey = 'booking_id';
	let selectedTeacher = 'empty';
	let selectedCourseName = 'empty';
	let	selectedCourseId = 'empty';
	let teachers = [];
	let courseNames = [];
	let courseIds = [];
	$: filteredBookings = $itemList;

	onMount(async () => {
		//vi skal sætte displaynames
		let response = await fetch(`${$BASE_URL}/bookings`, {
			credentials: 'include'
		});

		if (response.ok) {
			let result = await response.json();
			itemList.set(result.data);

			teachers = result.data.map((booking) => {
				return {
					teacher_id: booking.Course.Teacher.teacher_id,
					email: booking.Course.Teacher.email
				};
			});

			courseNames = result.data.map((booking) => {
				return {
					course_id: booking.course_id,
					course_name: booking.Course.course_name
				};
			});

			courseIds = result.data.map((booking) => {
				return {
					course_id: booking.course_id
				};
			});

			teachers = removeDuplicates(teachers, 'teacher_id');
			courseNames = removeDuplicates(courseNames, 'course_id');
			courseIds = removeDuplicates(courseIds, 'course_id');

		} else {
			console.error('Failed to fetch bookings from the server');
		}
		//vi skal hente vores items fra backend og sætte itemstore

		fetchHeaderKeys().then(() => {
			const derivedHeaderKeys = derived(itemList, ($itemList) => {
				if ($itemList.length > 0) {
					return Object.keys($itemList[0]);
				} else {
					fetchHeaderKeys();
				}
				return [];
			});

			derivedHeaderKeys.subscribe((keys) => {
				if (keys.length > 0) {
					setHeaderKeys(keys);
				}
			});
		});
	});

	/* 
	So, in simple terms, this code is saying: 
	"For each teacher in the `teachers` array, if this is the first time we're 
	seeing this `teacher_id`, include the teacher in the new array. 
	If we've seen this `teacher_id` before, don't include the teacher."
	The result is a new array with no duplicate `teacher_id`s.
	*/

	function removeDuplicates(array, prop) {
		return array.filter((obj, index, self) =>
			index === self.findIndex((t) => t[prop] === obj[prop])
		);
	}

	function setHeaderKeys(data) {
		const excludeKeys = ['_id', 'hashed_password'];

		// 	Made in cooperation with chatgpt (Marcus)
		const filteredKeys = data.filter(
			(key) => !excludeKeys.some((excludeKey) => key.endsWith(excludeKey) || key === excludeKey)
		);
		headerKeys.set(filteredKeys);
		headerKeysDanish.set(filteredKeys.map((key) => displayNames[key] || key));
	}

	async function fetchHeaderKeys() {
		const response = await fetch(`${$BASE_URL}/headerKey/${collection}`, {
			credentials: 'include'
		});

		if (response.ok) {
			const result = await response.json();
			setHeaderKeys(result.data);
		} else {
			console.error('Failed to fetch header keys from the server');
		}
	}

	function formatInventory(inventories) {
		if (!inventories) return '';
		return Array.isArray(inventories) ? inventories.join(', ') : inventories;
	}

	function handleOptionChange(event) {

		console.log(selectedCourseName);
		if (selectedCourseName !== "empty") {
			console.log(selectedCourseName);
			filteredBookings = filteredBookings.filter((booking) => booking.Course.course_name == selectedCourseName);
		} 

		if (selectedTeacher !== "empty") {
			console.log(selectedTeacher);
			filteredBookings = filteredBookings.filter((booking) => booking.Course.Teacher.email == selectedTeacher);
		}




	}

	function handleCourseNameChange(event) {
		
	}
	
	function handleTeacherChange(event) {
		console.log(e.target.value);

		//when teacher changes, so does the course name selection
	}

	function handleCourseIdChange(event) {
		
		if (event.target.value !== "empty") {
			console.log(selectedCourseId);
			filteredBookings = filteredBookings.filter((booking) => booking.course_id == selectedCourseId);
		}
			//when teacher changes, so does the course name selection
	}


	function resetFilters() {
		selectedTeacher = 'empty';
		selectedCourseName = 'empty';
	}

</script>

<div class="d-flex flex-column align-items-center mx-auto" style="max-width: 400px;">
	<div class="w-100">
		<SelectBoxOptions
			label={'Holdnavn'}
			selected={selectedCourseName}
			idKey={'course_id'}
			optionName={'course_name'}
			options={courseNames}
			onOptionChange={handleOptionChange}
		/>
	</div>

	<div class="w-100">
		<SelectBoxOptions
			label={'Underviser'}
			selected={selectedTeacher}
			idKey={'teacher_id'}
			optionName={'email'}
			options={teachers}
			onOptionChange={handleOptionChange}
		/>
	</div>

	<div class="w-100">
		<SelectBoxOptions
			label={'Kursus id'}
			selected={selectedCourseId}
			idKey={'course_id'}
			optionName={'course_id'}
			options={courseIds}
			onOptionChange={handleOptionChange}
		/>
	</div>
</div>

<div class="container mt-5">
	<div class="row justify-content-center">
		<div class="col-12 col-lg-10">
			{#if $itemList.length > 0}
				<div class="list-group">
					<table class="w-100">
						<thead>
							<tr>
								{#each $headerKeysDanish as key (key)}
									<th>{$displayNames[key]}</th>
								{/each}
							</tr>
						</thead>
						<tbody>
							{#each filteredBookings as listItem, index}
								<tr class="hover-row">
									{#each $headerKeys as key (key)}
										<td>
											{#if key === 'inventories' || key === 'inventory' || key === 'item_list' || key === 'Inventories'}
												{formatInventory(listItem[key])}
											{:else if key === 'start_date' || key === 'end_date'}
												{new Date(formatInventory(listItem[key])).toLocaleDateString()}
											{:else}
												{listItem[key]}
											{/if}
										</td>
									{/each}
									<td>
										<button
											class="btn"
											on:click={() => {
												selectedItem.set(listItem);
												showEditModal.set(true);
											}}
											title="Rediger"
										>
											<i class="bi bi-pencil-square"></i>
										</button>
									</td>
									<td>
										<button
											class="btn"
											on:click={() => {
												selectedItem.set(listItem);
												showDeleteModal.set(true);
											}}
											title="Slet"
										>
											<i class="bi bi-trash-fill"></i>
										</button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else if $optionId}
				<div class="alert alert-warning" role="alert">Ingen data</div>
			{/if}
		</div>
	</div>
</div>

<!-- <ModalEdit {collection} {idKey} />  -->

<ModalDelete {collection} {idKey} />

<style>
	.hover-row:hover {
		background-color: #e0e0e0;
	}
</style>
