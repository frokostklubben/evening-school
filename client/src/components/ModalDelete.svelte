<script>
	import { Button, Modal } from 'flowbite-svelte';
	import { toast, Toaster } from 'svelte-french-toast';
	import { itemList } from '../stores/itemListStore.js';
	import { BASE_URL } from '../stores/apiConfig.js';
	import { showDeleteModal, selectedItem } from '../stores/modalStore.js';

	export let collection = '';
	export let idKey = '';

	async function deleteItem() {
		try {
			const response = await fetch(`${$BASE_URL}/${collection}/${$selectedItem[idKey]}`, {
				credentials: 'include',
				method: 'DELETE'
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.message || 'Failed to delete item');
			}

			toast.success(`${collection}#${$selectedItem[idKey]} er slettet`);

			itemList.update((item) => {
				return item.filter((booking) => booking[idKey] !== $selectedItem[idKey]);
			});

			return 'Deleted Successfully';
		} catch (error) {
			toast.error(`Fejl ved sletning: ${error.message}`);
			console.error('Error deleting item:', error);
		}
	}
</script>

<Modal bind:open={$showDeleteModal} size="xs" autoclose>
	<div class="text-center">
		<h3 class="mb-3 text-lg font-normal text-gray-500 dark:text-gray-400">
			Er du sikker på at du vil slette?
		</h3>
		<Button class="me-2" color="red" on:click={deleteItem}>Ja, slet</Button>
		<Button color="alternative">Afbryd</Button>
	</div>
</Modal>

<Toaster />
