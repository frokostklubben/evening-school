<script>
	import { onMount } from 'svelte';
	import SelectBoxOptions from '../../components/SelectBoxOptions.svelte';

	onMount(() => {
		// hente alle courses tilknyttet school_id
		// hente locations og classrooms tilknyttet school_id
		// hente alle teacher tilknyttet school_id
	});

	let teacherEmail = {}
	let teachers = [{}]

    function saveChanges() {
        console.log("saved");
    }


	function handleOptionChange(){}

</script>

<h2>Event/foredrag</h2>

<div class="border border-2 p-3 m-3">
	<p><strong>Trin 1</strong></p>
		<SelectBoxOptions
		label = {"Kopier fra tidligere oprettet booking"}
		selected={teacherEmail}
		idKey={"teacher_id"}
		optionName= {"email"}
		options = {teachers}
		onOptionChange={handleOptionChange}
	/>
		<SelectBoxOptions
		label = {"Fortsæt tidligere booking kladde (Kurser der ikke er blevet booket færdig)"}
		selected={teacherEmail}
		idKey={"teacher_id"}
		optionName= {"email"}
		options = {teachers}
		onOptionChange={handleOptionChange}
	/>	
	<form on:submit|preventDefault={saveChanges} class="needs-validation">
        <label for="title">Titel</label>
		<input type="text" id="title" class="form-control" required />
        <label for="title">Beskrivelse</label>
		<textarea type="text" id="description" class="form-control" required />

		<SelectBoxOptions
			label = {"Vælg underviser"}
			selected={teacherEmail}
			idKey={"teacher_id"}
			optionName= {"email"}
			options = {teachers}
			onOptionChange={handleOptionChange}
		/>
		<button type="submit" class="btn btn-primary">Fortsæt</button>
	</form>
</div>

<div class="border border-2 p-3 m-3">
	<p><strong>Trin 2</strong></p>
	<SelectBoxOptions
	label = {"Vælg afdeling"}
	selected={teacherEmail}
	idKey={"teacher_id"}
	optionName= {"email"}
	options = {teachers}
	onOptionChange={handleOptionChange}
	/>
	<SelectBoxOptions
	label = {"Vælg lokale"}
	selected={teacherEmail}
	idKey={"teacher_id"}
	optionName= {"email"}
	options = {teachers}
	onOptionChange={handleOptionChange}
	/>
	<button type="button" class="btn btn-primary">forsæt</button>
</div>

<div class="border border-2 p-3 m-3">
	<p><strong>Trin 3</strong></p>
</div>
