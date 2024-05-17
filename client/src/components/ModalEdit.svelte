<script>
	import { Button, Modal } from 'flowbite-svelte';
	import { toast, Toaster } from 'svelte-french-toast';
	import { BASE_URL } from '../stores/apiConfig.js';
	import { selectedItem, showEditModal } from '../stores/modalStore.js';
	import { itemList } from '../stores/itemListStore.js';
	import { displayNames } from '../stores/dictionaryStore.js';

	export let idKey;
	export let collection = '';
	let itemKeys = [];

	$: {
		if ($selectedItem) {
			itemKeys = Object.keys($selectedItem).filter((key) => !key.endsWith('_id'));
		}
	}


	// TODO: move to service - ts problems
	function validateEmail(email) {
		const regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
		return regex.test(email);
	}

	async function saveChanges() {
		if ($selectedItem.email) {
			if (!validateEmail($selectedItem.email)) {
				toast.error('Indtast en gyldig email-adresse.');
				return;
			}
		}

		try {
			const response = await fetch(`${$BASE_URL}/${collection}/${$selectedItem[idKey]}`, {
				credentials: 'include',
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify($selectedItem)
			});

			const result = await response.json();
			if (response.ok) {
				toast.success('Opdatering vellykket!');

				const index = $itemList.findIndex((item) => item[idKey] === $selectedItem[idKey]);
				if (index !== -1) {
					$itemList[index] = $selectedItem;
				}

				showEditModal.set(false);
			} else {
				toast.error('Fejl ved opdatering:', error.message);

				// throw new Error(result.message || 'Failed to update item');
			}
		} catch (error) {
			toast.error('Fejl ved opdatering:', error.message);
		}
	}

	function isEmail(value) {
		const emailPattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
		return emailPattern.test(value);
	}
</script>

<Modal title="Redigere" bind:open={$showEditModal} autoclose>
	<div class="container-fluid mt-3">
		<div class="row justify-content-center">
			<div class="col-md-8">
				<form on:submit|preventDefault={saveChanges} class="needs-validation">
					{#each itemKeys as key (key)}
						<div class="mb-3">
							<label for={key} class="form-label">{$displayNames[key]}</label>

							{#if typeof $selectedItem[key] === 'number'}
								<input
									type="number"
									class="form-control"
									id={key}
									bind:value={$selectedItem[key]}
									required
								/>
							{:else if isEmail($selectedItem[key])}
								<input
									type="email"
									class="form-control"
									id={key}
									bind:value={$selectedItem[key]}
									required
								/>
							{:else if key === 'start_date' || key === 'end_date'}
							<input
								type="date"
								class="form-control"
								id={key}
								bind:value={$selectedItem[key]}
								min={new Date().toISOString().split('T')[0]}
								required
								/>
							{:else}
								<input
									type="text"
									class="form-control"
									id={key}
									bind:value={$selectedItem[key]}
									required
								/>
							{/if}
						</div>
					{/each}
				</form>
			</div>
		</div>
	</div>

	<svelte:fragment slot="footer">
		<div class="container">
			<div class="text-center">
				<Button class="me-2" type="submit" color="green" on:click={saveChanges}>Gem</Button>
				<Button color="red">Afbryd</Button>
			</div>
		</div>
	</svelte:fragment>
</Modal>

<Toaster />
