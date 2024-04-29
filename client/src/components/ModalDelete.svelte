<script>
    import { Button, Modal } from 'flowbite-svelte';
    import { toast, Toaster } from 'svelte-french-toast';
    export let selectedItem;
    export let showDeleteConfirmModal = false;
    export let collection = "";
    export let idKey = "";


    
    async function deleteItem() {
		try {
			const response = await fetch(`http://localhost:8080/api/${collection}/${$selectedItem[idKey]}`, {
				method: 'DELETE'
			});
			if (!response.ok) throw new Error('Failed to delete item');
			console.log('Delete Successful');
			toast.success('Data slettet');
			return 'Deleted Successfully';
		} catch (error) {
			console.error('Error deleting item:', error);
		}
	}
</script>

<!-- Modal for delete user -->
<Modal bind:open={showDeleteConfirmModal} size="xs" autoclose>
	<div class="text-center">
		<h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
			Er du sikker på at du vil slette?
		</h3>
		<Button color="red" class="me-2" on:click={deleteItem}>Ja, slet</Button>
		<Button color="alternative">Afbryd</Button>
	</div>
    <Toaster />
</Modal>
