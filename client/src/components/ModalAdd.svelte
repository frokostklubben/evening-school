<script>
	// @ts-nocheck
	import { writable, get } from 'svelte/store';
	import { Button, Modal } from 'flowbite-svelte';
	import { toast, Toaster } from 'svelte-french-toast';
	import { BASE_URL } from '../stores/apiConfig.js';
	import { selectedItem, showAddModal, optionId } from '../stores/modalStore.js';
	import { itemList } from '../stores/itemListStore.js';
	import { displayNames } from '../stores/dictionaryStore.js';

	export let idKey;
	export let collection = '';
	export let fields = [];
	export let title;

	let itemKeys = [];

	// let formData = writable({});
	let formData = {};

	formData = fields.reduce((acc, field) => {
		acc[field.name] = '';
		return acc;
	}, {});

	// Update formData whenever selectedSchoolId changes
	// $: if (selectedSchoolId) {
	// 	formData.update((current) => ({
	// 		...current,
	// 		school_id: $selectedSchoolId // Adding school_id to formData
	// 	}));
	// }

	itemKeys = Object.keys(formData).filter((key) => !key.endsWith('_id'));

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

			console.log(response.ok); // Should log true if 200-299

			if (response.ok) {
				toast.success('Oprettelse vellykket!');

				$itemList.update((currentItems) => {
					return [...currentItems, result];
				});

				// const index = $itemList.findIndex((item) => item[idKey] === formData[idKey]);
				// if (index !== -1) {
				// 	$itemList[index] = formData;
				// }

				showAddModal.set(false);
			} else {
				throw new Error(result.message || 'Oprettelse mislykkedes');
			}
		} catch (error) {
			console.error('Error updating item:', error);
			toast.error('Fejl ved opdatering:', result.message);
		}
	}

	function isEmail(value) {
		const emailPattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
		return emailPattern.test(value);
	}
</script>

<!-- TODO: translate table_name -->
<Modal title="Læg til ny {title}" bind:open={$showAddModal} autoclose>
	<div class="container-fluid mt-5">
		<div class="row justify-content-center">
			<div class="col-md-8">
				<form on:submit|preventDefault={addItem} class="needs-validation">
					{#each itemKeys as key (key)}
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
