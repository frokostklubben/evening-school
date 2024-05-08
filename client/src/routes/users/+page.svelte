<script>
	import DropdownAndList from '../../components/DropdownAndList.svelte';
	import { displayNames } from '../../stores/dictionaryStore.js';
	import { user } from '../../stores/userStore.js';

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
	modalTitle={'kontormedarbejder'}
	optionName={'name'}
/>
