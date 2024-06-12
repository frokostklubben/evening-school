<script>
	import { onMount } from 'svelte';
	import ListItems from '../../../components/ListItems.svelte';
	import { BASE_URL } from '../../../stores/apiConfig.js';
	import { itemList } from '../../../stores/itemListStore.js';
	import { displayNames } from '../../../stores/dictionaryStore.js';
	import { user } from '../../../stores/userStore';
	import { headerKeysDanish } from '../../../stores/itemListStore.js';
	import { selectionsLoading } from '../../../stores/generalStore.js';
	import Spinner from '../../../components/Spinner.svelte';

	headerKeysDanish.set([]);
	displayNames.set({
			first_name: 'Fornavn',
			last_name: 'Efternavn',
			email: 'Email'
		});

	onMount(async () => {
		itemList.set([]);

		selectionsLoading.set(true);


		const response = await fetch(`${$BASE_URL}/users/${$user.school_id}`, {
			credentials: 'include'
		});

		if (response.ok) {
			let result = await response.json();
			itemList.set(result.data);
			selectionsLoading.set(false);
		} else {
			console.error('Failed to fetch users');
		}

	});
</script>

{#if $selectionsLoading}
	<Spinner />
{:else}
	<ListItems idKey={'user_id'} collection={'users'} showCoursesButton={false} />
{/if}
