<script>
	import DropdownAndList from '../../../components/DropdownAndList.svelte';
	import { displayNames } from '../../../stores/dictionaryStore.js';


	displayNames.set({
		first_name: 'Fornavn',
		last_name: 'Efternavn',
		email: 'Email'
	});
</script>

<DropdownAndList
	listIdKey={'user_id'}
	listCollection={'users'}
	optionsCollection={'schools'}
	optionsIdKey={'school_id'}
	label={'Aftenskole'}
	modalTitle={'Ny kontormedarbejder'}
	optionName={'name'}
	showButtons={false}
	showEditButton={true}
	showDeleteButton={true}
/>
