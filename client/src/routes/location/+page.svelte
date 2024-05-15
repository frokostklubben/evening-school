<script>
	import DropdownAndList from '../../components/DropdownAndList.svelte';
	import { displayNames } from '../../stores/dictionaryStore.js';

	displayNames.set({
		school_name: 'Skole',
		zip_code: 'Postnummer',
		city: 'By',
		street_name: 'Vejnavn',
		street_number: 'nr.'
	});
</script>

<DropdownAndList
	listIdKey={'location_id'}
	listCollection={'locations'}
	optionsCollection={'schools'}
	optionsIdKey={'school_id'}
	label={'Aftenskole'}
	modalTitle={'afdeling'}
	optionName={'name'}
	showCoursesButton={true}
/>
