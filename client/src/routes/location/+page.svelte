<script>
	import DropdownAndList from '../../components/DropdownAndList.svelte';
	import { displayNames } from '../../stores/dictionaryStore.js';
	import ModalAdd from '../../components/ModalAdd.svelte';
	import { Button } from 'flowbite-svelte';
	import { showAddModal, selectedSchoolId } from '../../stores/modalStore.js';

	let title = 'afdeling';

	let fields = [
		{ name: 'zip_code', label: 'Postnummer', type: 'number', required: true },
		{ name: 'city', label: 'By', type: 'text', required: true },
		{ name: 'street_name', label: 'Vejnavn', type: 'text', required: true },
		{ name: 'street_number', label: 'Husnummer', type: 'number', required: false }
	];

	function addLocation() {
		showAddModal.set(true);
	}

	displayNames.set({
		zip_code: 'Postnummer',
		city: 'By',
		street_name: 'Vejnavn',
		street_number: 'nr.'
	});
</script>

<!-- TODO: burde også checke om afdeling er valgt? -->
{#if showAddModal}
	<ModalAdd collection={'locations'} idKey="{'location_id'}}" {fields} {title} />
{/if}

<DropdownAndList
	listIdKey={'location_id'}
	listCollection={'locations'}
	optionsCollection={'schools'}
	label={'Afdelinger'}
/>

{#if $selectedSchoolId}
	<div class="text-center mt-10 mb-10">
		<Button type="submit" color="green" on:click={addLocation}>Ny afdeling</Button>
	</div>
{/if}
