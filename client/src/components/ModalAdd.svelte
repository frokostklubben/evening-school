<script>
	// @ts-nocheck
	import { Button, Modal } from 'flowbite-svelte';
	import { toast, Toaster } from 'svelte-french-toast';
	import { BASE_URL } from '../stores/apiConfig.js';
	import { showAddModal, optionId } from '../stores/modalStore.js';
	import { displayNames } from '../stores/dictionaryStore.js';
	import { itemList, headerKeys } from '../stores/itemListStore.js';

	export let idKey;
	export let collection = '';
	export let modalTitle
	let formData = {};

	// TODO: move to service - ts problems
	function validateEmail(email) {
		const regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
		return regex.test(email);
	}

	async function addItem() {
		formData[idKey] = $optionId;


		// Example validation: ensure all required fields are filled
		// if (fields.some((field) => field.required && !data[field.name])) {
		// 	toast.error('Please fill all required fields.');
		// 	return;
		// }

		// if (formData.email) {
		// 	if (!validateEmail(formData.email)) {
		// 		toast.error('Indtast en gyldig email-adresse.');
		// 		return;
		// 	}
		// }

		try {
			const response = await fetch(`${$BASE_URL}/${collection}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(formData)
			});

			const result = await response.json();

			if (response.ok) {
				toast.success('Oprettelse vellykket!');
				itemList.update((currentItems) => {
					return [...currentItems, result.data];
				});

				showAddModal.set(false);
			} else {
				throw new Error(result.message || 'Oprettelse mislykkedes');
			}
		} catch (error) {
			console.error('Error updating item:', error);
			toast.error('Fejl ved opdatering:', error.message);
		}
	}

	function isEmail(value) {
		const emailPattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
		return emailPattern.test(value);
	}
</script>

<!-- TODO: translate table_name -->
<Modal title="Læg til ny {modalTitle}" bind:open={$showAddModal} autoclose>
	<div class="container-fluid mt-5">
		<div class="row justify-content-center">
			<div class="col-md-8">
				<form on:submit|preventDefault={addItem} class="needs-validation">
					{#each $headerKeys as key (key)}
						<div class="mb-3">
							<label for={key} class="form-label">{$displayNames[key]}</label>

							{#if typeof formData[key] === 'number'}
								<input
									type="number"
									class="form-control"
									id={key}
									bind:value={formData[key]}
									required
								/>
							{:else if isEmail(formData[key])}
								<input
									type="email"
									class="form-control"
									id={key}
									bind:value={formData[key]}
									required
								/>
							{:else}
								<input
									type="text"
									class="form-control"
									id={key}
									bind:value={formData[key]}
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
				<Button type="submit" color="green" on:click={addItem}>Gem</Button>
				<Button color="red">Afbryd</Button>
			</div>
		</div>
	</svelte:fragment>
</Modal>

<Toaster />

<!-- 	{#each itemKeys as key (key)}
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
					{/each} -->