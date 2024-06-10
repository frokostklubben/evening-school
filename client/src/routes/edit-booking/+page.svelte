<script>
	import ModalDelete from '../../components/ModalDelete.svelte';
	import { derived } from 'svelte/store';
	import { headerKeys, headerKeysDanish, itemList } from '../../stores/itemListStore.js';
	import {
		optionId,
		selectedItem,
		showDeleteModal,
		showEditModal,
		editData
	} from '../../stores/modalStore.js';
	import { displayNames } from '../../stores/dictionaryStore.js';
	import { BASE_URL } from '../../stores/apiConfig.js';
	import { onMount } from 'svelte';
	import SelectBoxOptions from '../../components/SelectBoxOptions.svelte';
	import ModalEditBooking from '../../components/ModalEditBooking.svelte';

	let collection = 'bookings';
	let idKey;
	let selectedTeacher = 'empty';
	let selectedCourseName = 'empty';
	let selectedCourseId = 'empty';
	let teachers = [];
	let courseNames = [];
	let courseIds = [];
	$: filteredBookings = $itemList;
	$: filteredTeachers = teachers;
	$: filteredCourseIds = courseIds;
	$: filteredCourseNames = courseNames;

	$: groupedData = {};

	displayNames.set({
		bookingId: 'Booking ID',
		teacherEmail: 'Underviseremail',
		courseId: 'K.ID',
		courseName: 'Kursus',
		date: 'Dato',
		startTime: 'Start',
		endTime: 'Slut',
		roomName: 'Lokale',
		locationName: 'Afdeling'
	});

	onMount(async () => {
		fetchEditData();

		let response = await fetch(`${$BASE_URL}/bookings`, {
			credentials: 'include'
		});

		if (response.ok) {
			let result = await response.json();
			itemList.set(result.data);

			teachers = result.data.map((booking) => {
				return {
					teacher_id: booking.teacherId,
					email: booking.teacherEmail
				};
			});

			courseNames = result.data.map((booking) => {
				return {
					course_id: booking.courseId,
					course_name: booking.courseName
				};
			});

			courseIds = result.data.map((booking) => {
				return {
					course_id: booking.courseId
				};
			});

			teachers = removeDuplicates(teachers, 'teacher_id');
			courseNames = removeDuplicates(courseNames, 'course_id');
			courseIds = removeDuplicates(courseIds, 'course_id');
			groupData();
		} else {
			console.error('Failed to fetch bookings from the server');
		}

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

	async function fetchEditData() {
		try {
			const response = await fetch(`${$BASE_URL}/edit-booking-form-info`, {
				credentials: 'include'
			});

			if (response.ok) {
				const result = await response.json();
				editData.set(result.data);
			} else {
				console.error('Failed to fetch edit booking data from the server');
			}
		} catch (error) {
			console.error('Failed to fetch edit booking data from the server:', error.message);
		}
	}

	/* 
	So, in simple terms, this code is saying: 
	"For each teacher in the `teachers` array, if this is the first time we're 
	seeing this `teacher_id`, include the teacher in the new array. 
	If we've seen this `teacher_id` before, don't include the teacher."
	The result is a new array with no duplicate `teacher_id`s.
	*/

	function removeDuplicates(array, prop) {
		return array.filter(
			(obj, index, self) => index === self.findIndex((t) => t[prop] === obj[prop])
		);
	}

	function setHeaderKeys(data) {
		const excludeKeys = [
			'_id',
			'hashed_password',
			'roomId',
			'teacherId',
			'locationId',
			'courseId',
			'courseName',
			'teacherEmail'
		];

		// 	Made in cooperation with chatgpt (Marcus)
		const filteredKeys = data.filter(
			(key) => !excludeKeys.some((excludeKey) => key.endsWith(excludeKey) || key === excludeKey)
		);
		headerKeys.set(filteredKeys);
		headerKeysDanish.set(filteredKeys.map((key) => displayNames[key] || key));
	}

	async function fetchHeaderKeys() {
		const response = await fetch(`${$BASE_URL}/headerKey/edit-booking`, {
			credentials: 'include'
		});

		if (response.ok) {
			const result = await response.json();
			setHeaderKeys(result.data);
		} else {
			console.error('Failed to fetch header keys from the server');
		}
	}

	function groupData() {
		// Group the filteredBookings by courseName
		groupedData = filteredBookings.reduce((groups, item) => {
			const key = item.courseId;
			if (!groups[key]) {
				groups[key] = [];
			}
			groups[key].push(item);
			return groups;
		}, {});
	}

	function filterList() {
		filteredBookings = $itemList;

		filteredBookings.sort((a, b) => a.courseId - b.courseId);

		if (selectedCourseName !== 'empty') {
			filteredBookings = filteredBookings.filter(
				(booking) => booking.courseName == selectedCourseName
			);
		}

		if (selectedTeacher !== 'empty') {
			filteredBookings = filteredBookings.filter(
				(booking) => booking.teacherEmail == selectedTeacher
			);
		}

		if (selectedCourseId !== 'empty') {
			filteredBookings = filteredBookings.filter(
				(booking) => booking.courseId == Number(selectedCourseId)
			);
		}

		if (
			selectedCourseName === 'empty' &&
			selectedTeacher === 'empty' &&
			selectedCourseId === 'empty'
		) {
			resetFilters();
		}

		groupData();
	}

	function handleCourseNameChange(event) {
		if (event.target.value !== 'empty') {
			selectedCourseName = event.target.value;

			filteredTeachers = $itemList
				.filter((booking) => booking.courseName === selectedCourseName)
				.map((booking) => {
					return {
						teacher_id: booking.teacherId,
						email: booking.teacherEmail
					};
				});

			filteredTeachers = removeDuplicates(filteredTeachers, 'teacher_id');

			filteredCourseIds = $itemList
				.filter((booking) => booking.courseName === selectedCourseName)
				.map((booking) => {
					return {
						course_id: booking.courseId
					};
				});

			filteredCourseIds = removeDuplicates(filteredCourseIds, 'course_id');
		} else {
			selectedCourseName = 'empty';
		}
		filterList();
	}

	function handleTeacherChange(event) {
		if (event.target.value !== 'empty' && selectedCourseName === 'empty') {
			selectedTeacher = event.target.value;

			filteredCourseNames = $itemList
				.filter((booking) => booking.teacherEmail === selectedTeacher)
				.map((booking) => {
					return {
						course_id: booking.courseId,
						course_name: booking.courseName
					};
				});

			filteredCourseNames = removeDuplicates(filteredCourseNames, 'course_id');

			filteredCourseIds = $itemList
				.filter((booking) => booking.teacherEmail === selectedTeacher)
				.map((booking) => {
					return {
						course_id: booking.courseId
					};
				});

			filteredCourseIds = removeDuplicates(filteredCourseIds, 'course_id');
		} else if (event.target.value !== 'empty' && selectedCourseName !== 'empty') {
			selectedTeacher = event.target.value;

			filteredCourseNames = $itemList
				.filter((booking) => booking.teacherEmail === selectedTeacher)
				.filter((booking) => booking.courseName === selectedCourseName)
				.map((booking) => {
					return {
						course_id: booking.courseId,
						course_name: booking.courseName
					};
				});

			filteredCourseNames = removeDuplicates(filteredCourseNames, 'course_id');

			filteredCourseIds = $itemList
				.filter((booking) => booking.teacherEmail === selectedTeacher)
				.filter((booking) => booking.courseName === selectedCourseName)
				.map((booking) => {
					return {
						course_id: booking.courseId
					};
				});

			filteredCourseIds = removeDuplicates(filteredCourseIds, 'course_id');
		} else {
			selectedTeacher = 'empty';
		}
		filterList();
	}

	function handleCourseIdChange(event) {
		if (event.target.value !== 'empty') {
			selectedCourseId = Number(event.target.value);

			// when picking a course_id, teacher email and course name will be set in the dropdown menus above

			selectedTeacher = $itemList
				.filter((booking) => booking.courseId === selectedCourseId)
				.map((booking) => {
					return booking.teacherEmail;
				})[0];

			selectedCourseName = $itemList
				.filter((booking) => booking.courseId === selectedCourseId)
				.map((booking) => {
					return booking.courseName;
				})[0];

			filteredCourseNames = $itemList
				.filter((booking) => booking.courseId === selectedCourseId)
				.map((booking) => {
					return {
						course_id: booking.courseId,
						course_name: booking.courseName
					};
				});

			filteredCourseNames = removeDuplicates(filteredCourseNames, 'course_id');

			filteredTeachers = $itemList
				.filter((booking) => booking.courseId === selectedCourseId)
				.map((booking) => {
					return {
						teacher_id: booking.teacherId,
						email: booking.teacherEmail
					};
				});

			filteredTeachers = removeDuplicates(filteredTeachers, 'teacher_id');
		} else {
			selectedCourseId = 'empty';
		}
		filterList();
	}

	function resetFilters() {
		selectedTeacher = 'empty';
		selectedCourseName = 'empty';
		selectedCourseId = 'empty';
		filteredCourseNames = courseNames;
		filteredTeachers = teachers;
		filteredCourseIds = courseIds;
		filteredBookings = $itemList;
		groupData();
	}

	function handleEditChanges(updatedBooking) {
		let updatedBookingId = updatedBooking.bookingId;

		filteredBookings = filteredBookings.map((item) => {
			return item.bookingId === updatedBookingId ? updatedBooking : item;
		});

		filterList();
	}
</script>

<div class="d-flex flex-column align-items-center mx-auto" style="max-width: 400px;">
	<div class="w-100">
		<SelectBoxOptions
			label={'Holdnavn'}
			selected={selectedCourseName}
			idKey={'course_name'}
			optionName={'course_name'}
			options={filteredCourseNames}
			onOptionChange={handleCourseNameChange}
		/>
	</div>

	<div class="w-100">
		<SelectBoxOptions
			label={'Underviser'}
			selected={selectedTeacher}
			idKey={'email'}
			optionName={'email'}
			options={filteredTeachers}
			onOptionChange={handleTeacherChange}
		/>
	</div>

	<div class="w-100">
		<SelectBoxOptions
			label={'Kursus ID'}
			selected={selectedCourseId}
			idKey={'course_id'}
			optionName={'course_id'}
			options={filteredCourseIds}
			onOptionChange={handleCourseIdChange}
		/>
	</div>

	<button class="btn btn-primary btn-md mt-3" title="Nulstil filtre" on:click={resetFilters}
		>Nulstil</button
	>
</div>

<div class="container mt-5">
	<div class="row justify-content-center">
		<div class="col-12 col-lg-10">
			{#if filteredBookings.length > 0}
				{#each Object.keys(groupedData) as courseId}
					<div class="mt-3 border border-2 p-3 mb-3">
						<h4>{groupedData[courseId][0].courseName} | Kursus ID #{courseId}</h4>
						<h5>{groupedData[courseId][0].teacherEmail}</h5>
						<div class="list-group mt-6">
							<table class="w-100 spaced-table">
								<thead>
									<tr>
										{#each $headerKeysDanish as key (key)}
											<th>{$displayNames[key]}</th>
										{/each}
									</tr>
								</thead>
								<tbody>
									{#each groupedData[courseId] as listItem}
										<tr class="hover-row">
											{#each $headerKeys as key (key)}
												<td>
													{#if key === 'date'}
														{new Date(listItem[key]).toLocaleDateString()}
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
														console.log('selectedItem:', $selectedItem);

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
					</div>
				{/each}
			{:else if $optionId}
				<div class="alert alert-warning" role="alert">Ingen data</div>
			{/if}
		</div>
	</div>
</div>

<ModalEditBooking onEditChanges={handleEditChanges} />

<ModalDelete {collection} idKey={'bookingId'} />

<style>
	.hover-row:hover {
		background-color: #e0e0e0;
	}

	.spaced-table th,
	.spaced-table td {
		padding: 0 1rem;
	}
</style>
