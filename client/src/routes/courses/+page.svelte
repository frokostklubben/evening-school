<script>
	import { displayNames } from '../../stores/dictionaryStore.js';
	import DropdownAndList from '../../components/DropdownAndList.svelte';
	import ListItems from '../../components/ListItems.svelte';
	import { user } from '../../stores/userStore.js';
	import { onMount } from 'svelte';
	import { optionId } from '../../stores/modalStore.js';
	import { BASE_URL } from '../../stores/apiConfig.js';
	import { itemList } from '../../stores/itemListStore.js';

	// TODO: add course description when that code is merged

	displayNames.set({
		course_name: 'Kursusnavn'
	});

	onMount(() => {
		if ($optionId) {
			loadCourses();
		}
	});

	async function loadCourses() {
		const response = await fetch(`${$BASE_URL}/courses/${$optionId}`, {
			credentials: 'include'
		});
		if (response.ok) {
			const data = await response.json();
			itemList.set(data.courses);
			console.log('itemList:', $itemList);
			headerKeys.set(['course_name', 'instructor', 'start_date']);
			headerKeysDanish.set(['Kursusnavn', 'Instruktør', 'Startdato']);
		} else {
			console.error('Failed to load courses');
		}
	}
</script>

<h2>Oversigt over en afdelings hold</h2>

<!-- SchoolId comes from the logged in user -->
<!-- <DropdownAndList
	listIdKey={'course_id'}
	listCollection={'courses'}
	optionsCollection={'locations/1'}
	optionsIdKey={'location_id'}
	label={'Afdelinger'}
	optionName={'school_name'}
	modalTitle={'hold'}
	showCoursesButton={false}
/>
 -->
