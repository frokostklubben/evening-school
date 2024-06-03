<script>
	export let label = '';
	export let options;
	export let selected = '';
	export let onOptionChange;
	export let idKey;
	export let optionName;
</script>

<label>
	{label}
	<select class="form-select" bind:value={selected} on:change={(event) => onOptionChange(event)}>
		<option value="empty">Vælg</option>
		{#each options as option}
			<option value={option[idKey]}>{option[optionName]}</option>
		{/each}
	</select>
</label>

<style>
	label {
		display: flex;
		flex-direction: column;
		margin-bottom: 1em;
	}
	select {
		box-sizing: border-box;
	}
</style>
