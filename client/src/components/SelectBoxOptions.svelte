<script>
//@ts-nocheck

    export let label = '';
    export let options; //make a store instead
    export let selected = '';
    export let onOptionChange
    
</script>

<label>
    {label}
    <select bind:value={selected} on:change={onOptionChange}>
        <option value="">Vælg</option>
        {#each options as option (option.name)}
            <option value={option.school_id}>{option.name}</option>
        {/each}
    </select>
</label>

<style>
    label {
        display: flex;
        flex-direction: column;
        /*width: 100%;*/
        margin-bottom: 1em;
    }
    select {
       /* margin-top: 0.5em;
        padding: 0.5em;*/
        /*width: 100%;*/
        box-sizing: border-box;
    }
</style>

<!--
    <label>
	{label}
	<select bind:value={selected}>
		<option value="">Vælg</option>
		{#each options as option (option.value)}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select>
</label>
-->