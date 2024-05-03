<script>
	import DropdownAndList from '../../components/DropdownAndList.svelte';
	import { displayNames } from '../../stores/dictionaryStore.js';
	import ModalAdd from '../../components/ModalAdd.svelte';
	import { Button } from 'flowbite-svelte';
	import { showAddModal, optionId } from '../../stores/modalStore.js';
	import { onMount } from 'svelte';
	import { selectedItem } from '../../stores/modalStore.js';

	let title = 'hold';

	let fields = [
		{ name: 'zip_code', label: 'Postnummer', type: 'number', required: true },
		{ name: 'city', label: 'By', type: 'text', required: true },
		{ name: 'street_name', label: 'Vejnavn', type: 'text', required: true },
		{ name: 'street_number', label: 'Husnummer', type: 'number', required: false }
	];

	onMount(() => {
		$optionId = '';
		console.log('selectedItem in courses page', selectedItem);
	});

	function addCourse() {
		showAddModal.set(true);
	}

	// displayNames.set({
	// });
</script>

<h2>Oversigt over en afdelingers hold</h2>

<DropdownAndList
	listIdKey={'courses_id'}
	listCollection={'courses'}
	optionsCollection={'schools'}
	label={'Afdeling'}
/>

<!-- {#if $optionId}
	<div class="text-center mt-10 mb-10">
		<Button type="submit" color="green" on:click={addCourse}>Nyt hold</Button>
	</div>
{/if}


{#if showAddModal}
	<ModalAdd collection={'locations'} idKey={'school_id'} {fields} {title} />
{/if} -->
