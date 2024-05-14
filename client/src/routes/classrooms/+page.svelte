<script>
	import DropdownAndList from '../../components/DropdownAndList.svelte';
	import { displayNames } from '../../stores/dictionaryStore.js';
	import { optionId } from '../../stores/modalStore';

	displayNames.set({
		room_id: 'Rum ID',
		location_id: 'Lokation ID',
		purpose_id: 'Formål ID',
		capacity: 'Kapacitet'
	});
</script>

<DropdownAndList
	listIdKey={'location_id'}
	listCollection={`locations`}
	optionsCollection={'classrooms'}
	optionsIdKey={'room_id'}
	label={'Afdeling'}
	modalTitle={'lokale'}
	optionName={'capacity'}
	showCoursesButton={true}
/>
