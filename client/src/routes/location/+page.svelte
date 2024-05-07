<script>
	//@ts-nocheck
	import DropdownAndList from '../../components/DropdownAndList.svelte';
	import { displayNames } from '../../stores/dictionaryStore.js';
	import { user } from '../../stores/userStore.js';

	displayNames.set({
		zip_code: 'Postnummer',
		city: 'By',
		street_name: 'Vejnavn',
		street_number: 'nr.'
	});
</script>

<!-- {#if $user.email} -->
<DropdownAndList
	listIdKey={'location_id'}
	listCollection={'locations'}
	optionsCollection={'schools'}
	optionsIdKey={'school_id'}
	label={'Aftenskole'}
	modalTitle={'afdeling'}
	optionName={'name'}
/>
<!-- {:else}
	<div>Du har ikke adgang her</div>
{/if} -->
