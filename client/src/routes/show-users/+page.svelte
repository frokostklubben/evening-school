<script>
	// @ts-nocheck
	import DropdownAndList from '../../components/DropdownAndList.svelte';
	import { displayNames } from '../../stores/dictionaryStore';

	displayNames.set({
		first_name: 'Fornavn',
		last_name: 'Efternavn',
		email: 'Email'
	});
</script>

<DropdownAndList
	listIdKey={'user_id'}
	listCollection={'users'}
	optionsIdKey={'school_id'}
	optionsCollection={'schools'}
	label={'Ansatte ved aftenskole'}
/>
