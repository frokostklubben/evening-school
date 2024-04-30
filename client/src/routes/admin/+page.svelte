<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import ListItems from '../../components/ListItems.svelte';
	import { itemList } from '../../stores/itemListStore.js';
	import { BASE_URL } from '../../stores/apiConfig.js';
	import DropdownAndList from '../../components/DropdownAndList.svelte';
	import { displayNames } from '../../stores/dictionaryStore.js'

	let schools = [];
	let users = [];
	let hasSelected = false;
	let options = [];

	// TODO: se på koden under - have 1 udgave
	onMount(() => {
		fetchSchools();
	});

	/*
	onMount(async () => {
		const response = await fetch(`${$BASE_URL}/schools`);
		const result = await response.json();
		options = result.data.map((item) => ({
			label: item.name,
			value: item.school_id
		}));
	});
	*/

	displayNames.set({
		first_name: 'Fornavn',
		last_name: 'Efternavn',
		email: 'Email'
	});

	async function fetchSchools() {
		const response = await fetch(`${$BASE_URL}/schools`);
		if (response.ok) {
			const result = await response.json();
			schools = result.data;
		} else {
			console.error('Failed to fetch schools');
		}
	}

	async function fetchUsersForSchool(schoolId) {
		if (schoolId) {
			const response = await fetch(`${$BASE_URL}/users/${schoolId}`);
			if (response.ok) {
				const result = await response.json();
				//users = result.data;
				hasSelected = true;
				itemList.set(result.data);
				console.log($itemList);
			} else {
				console.error('Failed to fetch users for school');
			}
		}
	}

	function onSchoolChange(event) {
		fetchUsersForSchool(event.target.value);
		hasSelected = false;
	}
</script>



<h2 class="mb-4">Se alle kontoransatte</h2>

<div class="mb-3">
	<select id="school-select" class="form-select" on:change={onSchoolChange}>
		<option value="">Vælg en skole</option>
		{#each schools as school}
			<option value={school.school_id}>{school.name}</option>
		{/each}
	</select>
</div>

{#if $itemList.length > 0}
	<ListItems
		collection={'users'}
		idKey="user_id"
	/>
	
{:else if hasSelected}
	<div>Ingen brugere fundet</div>
{/if}

<!--
<DropdownAndList
	listIdKey={'user'}
	listCollection={'users'}
	optionsIdKey={'school_id'}
	optionsCollection={'schools'}
	label={'Ansatte ved aftenskole'}
/>
-->