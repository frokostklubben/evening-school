<script lang="ts">
	import { onMount } from 'svelte';
	import SelectBoxOptions from '../../components/SelectBoxOptions.svelte';

	let school_id = '';
	let options: { value: number; label: string }[] = [];
	// TODO replace with the correct URL from the store
	const BASE_URL = 'http://localhost:8080/api/schools';

	onMount(async () => {
		const response = await fetch(BASE_URL);
		const result = await response.json();

		options = result.data.map((item: any) => ({
			label: item.name,
			value: item.school_id
		}));
	});

	async function handleSubmit(event: Event) {
		event.preventDefault();

		const data = {
			school_id,
			zip_code: (event.target as any).zip_code.value,
			city: (event.target as any).city.value,
			street_name: (event.target as any).street_name.value,
			street_number: (event.target as any).street_number.value
		};

		const response = await fetch('http://localhost:8080/api/locations', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});

		// Change to a toast
		if (response.ok) {
			alert('Location created');
		} else {
			alert('Location not created');
		}

		if (event.target) {
			(event.target as HTMLFormElement).reset();
		}
	}
</script>

<form method="POST" on:submit={handleSubmit}>
	<!-- <SelectBoxOptions {options} bind:selected={school_id} label="Aftenskole" /> -->
	<label>
		Postnummer
		<input name="zip_code" type="number" />
	</label>
	<label>
		City
		<input name="city" type="text" />
	</label>
	<label>
		Vejnavn
		<input name="street_name" type="text" />
	</label>
	<label>
		Nr.
		<input name="street_number" type="number" />
	</label>
	<button>Opret</button>
</form>

<style>
	form {
		display: flex;
		flex-direction: column;
		align-items: start;
		max-width: 300px;
		margin: auto;
		margin-top: 15px;
	}
	label {
		display: flex;
		flex-direction: column;
		width: 100%;
		margin-bottom: 1em;
	}
	input,
	select {
		margin-top: 0.5em;
		padding: 0.5em;
		width: 100%;
		box-sizing: border-box;
	}
	button {
		padding: 0.5em;
		width: 100%;
		box-sizing: border-box;
	}
</style>
