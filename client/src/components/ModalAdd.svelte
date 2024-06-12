<script>
	import { Button, Modal } from 'flowbite-svelte';
	import { toast, Toaster } from 'svelte-french-toast';
	import { BASE_URL, AUTH_URL } from '../stores/apiConfig.js';
	import { showAddModal, optionId } from '../stores/modalStore.js';
	import { displayNames } from '../stores/dictionaryStore.js';
	import { headerKeys, itemList } from '../stores/itemListStore.js';

	export let idKey;
	export let collection = '';
	export let modalTitle;
	let formData = {};


	async function addItem() {
		formData[idKey] = $optionId;

		let url = `${$BASE_URL}/${collection}`;

		if (collection === 'users') {
			url = `${$AUTH_URL}/auth/signup`;
		}

		try {
			const response = await fetch(url, {
				credentials: 'include',
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(formData)
			});


			const result = await response.json();

			if (response.ok) {
				// specific for dates
				if (result.data.start_date && result.data.end_date) {
					result.data.end_date = new Date(result.data.end_date).toISOString().split('T')[0];
					result.data.start_date = new Date(result.data.start_date).toISOString().split('T')[0];
				}

				itemList.update((currentItems) => {
					return [...currentItems, result.data];
				});

				toast.success('Oprettelse vellykket!');
				showAddModal.set(false);
			} else {
				console.error(`Fejl ved oprettelse: ${result.message || 'Oprettelse mislykkedes'}`);
			}
		} catch (error) {
			console.error('Fejl ved oprettelse:', error.message);
		}
	}
	function isEmail(value) {
		const emailPattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
		return emailPattern.test(value);
	}
</script>

<Modal title={modalTitle} bind:open={$showAddModal} autoclose>
	<div class="container-fluid mt-3">
		<div class="row justify-content-center">
			<div class="col-md-8">
				<form on:submit|preventDefault={addItem} class="needs-validation">
					{#each $headerKeys as key (key)}
						<div class="mb-3">
							<label for={key} class="form-label">{$displayNames[key]}</label>

							{#if typeof formData[key] === 'number' || key === 'capacity'}
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
							{:else if key === 'start_date' || key === 'end_date'}
								<input
									type="date"
									class="form-control"
									id={key}
									bind:value={formData[key]}
									min={new Date().toISOString().split('T')[0]}
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
				<Button class="me-2" type="submit" color="green" on:click={addItem}>Gem</Button>
				<Button color="red">Afbryd</Button>
			</div>
		</div>
	</svelte:fragment>
</Modal>

<Toaster />
