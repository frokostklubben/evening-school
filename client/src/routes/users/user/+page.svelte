<script>
	import { onMount } from 'svelte';
	import ListItems from '../../../components/ListItems.svelte';
	import { BASE_URL } from '../../../stores/apiConfig.js';
	import { itemList } from '../../../stores/itemListStore.js';
	import { displayNames } from '../../../stores/dictionaryStore.js';
	import { user } from '../../../stores/userStore';

	onMount(async () => {
		itemList.set([]);

		const response = await fetch(`${$BASE_URL}/users/${$user.school_id}`, {
			credentials: 'include'
		});

		if (response.ok) {
			let result = await response.json();
			itemList.set(result.data);
		} else {
			console.error('Failed to fetch users');
		}

		displayNames.set({
			first_name: 'Fornavn',
			last_name: 'Efternavn',
			email: 'Email'
		});
	});
</script>

<ListItems idKey={'user_id'} collection={'users'} showCoursesButton={false} />
