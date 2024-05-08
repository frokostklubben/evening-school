<script>
	import { onMount } from 'svelte';

	onMount(() => {
		// hente alle courses tilknyttet school_id
		// hente locations og classrooms tilknyttet school_id
		//
	});

    function saveChanges() {
        console.log("saved");
    }
</script>

<h2>Event/foredrag</h2>

<div>
	<p>Trin 1</p>
	<form on:submit|preventDefault={saveChanges} class="needs-validation">
        <label for="title">Titel</label>
		<input type="text" id="title" class="form-control" required />
        <label for="title">Beskrivelse</label>
		<textarea type="text" id="description" class="form-control" required />
        <button type="submit" class="btn btn-primary">Gem</button>
	</form>
</div>

<div>
	<p>Trin 2</p>
</div>

<div>
	<p>Trin 3</p>
</div>
