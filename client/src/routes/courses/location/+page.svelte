<script>
	import { displayNames } from '../../../stores/dictionaryStore.js';
	import ListItems from '../../../components/ListItems.svelte';
	import { onMount } from 'svelte';
	import { optionId } from '../../../stores/modalStore.js';
	import { BASE_URL } from '../../../stores/apiConfig.js';
	import { itemList } from '../../../stores/itemListStore.js';
	import { titleStore } from '../../../stores/titleStore.js';
	import GoBackButton from '../../../components/GoBackButton.svelte';
	import { headerKeysDanish } from '../../../stores/itemListStore.js';

	headerKeysDanish.set([]);

	displayNames.set({
		courseId: 'ID',
		course_name: 'Kursusnavn',
		description: 'Beskrivelse'
	});

	onMount(() => {
		itemList.set([]);
		loadCourses();
	});

	async function loadCourses() {
		const response = await fetch(`${$BASE_URL}/courses/${$optionId}`, {
			credentials: 'include'
		});
		if (response.ok) {
			const result = await response.json();
			const updatedCourses = result.data.map(course => {
				return {
					courseId: course.course_id,
					...course
				};
			})

			itemList.set(updatedCourses);
		} else {
			console.error('Failed to load courses');
		}
	}
</script>

<GoBackButton />

<div>
	<h2 class="pt-3 text-center">Hold hos {$titleStore}</h2>
</div>

<ListItems
	idKey={'course_id'}
	collection={'courses'}
	showButtons={true}
	showEditButton={true}
	showDeleteButton={true}
	buttons={[
		{ id: 1, key: 'course_id', url: '/location-history', text: 'Historik', store: 'course_name' }
	]}
/>
