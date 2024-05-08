<script>
	import { displayNames } from '../../stores/dictionaryStore.js';
	import DropdownAndList from '../../components/DropdownAndList.svelte';
	import { user } from '../../stores/userStore.js';

	// TODO: add course description when that code is merged

	displayNames.set({
		course_name: 'Kursusnavn'
	});
</script>

<h2>Oversigt over en afdelings hold</h2>

<!-- SchoolId comes from the logged in user -->
<DropdownAndList
	listIdKey={'course_id'}
	listCollection={'courses'}
	optionsCollection={'locations/1'}
	optionsIdKey={'location_id'}
	label={'Afdelinger'}
	optionName={'school_name'}
	modalTitle={'hold'}
/>
