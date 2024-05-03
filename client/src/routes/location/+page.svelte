<script>
	import DropdownAndList from '../../components/DropdownAndList.svelte';
	import { displayNames } from '../../stores/dictionaryStore.js';

	displayNames.set({
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
/>

