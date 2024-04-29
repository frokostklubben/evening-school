<script lang="ts">
    export let label = '';
    export let options: {value: number, label: string}[] = [];
    export let selected = '';
</script>

<label>
    {label}
    <select bind:value={selected}>
        <option value="">Vælg</option>
        {#each options as option (option.value)}
            <option value={option.value}>{option.label}</option>
        {/each}
    </select>
</label>

<style>
    label {
        display: flex;
        flex-direction: column;
        width: 100%;
        margin-bottom: 1em;
    }
    select {
        margin-top: 0.5em;
        padding: 0.5em;
        width: 100%;
        box-sizing: border-box;
    }
</style>