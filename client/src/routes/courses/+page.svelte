<script>
	import DropdownAndList from '../../components/DropdownAndList.svelte';
	import { displayNames } from '../../stores/dictionaryStore.js';

	// displayNames.set({
	// 	let fields = [
	// 	{ name: 'zip_code', label: 'Postnummer', type: 'number', required: true },
	// 	{ name: 'city', label: 'By', type: 'text', required: true },
	// 	{ name: 'street_name', label: 'Vejnavn', type: 'text', required: true },
	// 	{ name: 'street_number', label: 'Husnummer', type: 'number', required: false }
	// ];
	// });
</script>

<h2>Oversigt over en afdelings hold</h2>

<DropdownAndList
	listIdKey={'courses_id'}
	listCollection={'courses'}
	optionsCollection={'schools'}
	optionsIdKey={'school_id'}
	label={'Afdelinger'}
	modalTitle={'hold'}
/>

