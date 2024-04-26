<script lang="ts">
    import { onMount } from 'svelte';
    let aftenskole = '';
    let options: {value: string, label: string}[] = [];
  
    onMount(async () => {
        //const response = await fetch('https://your-api-url.com');
        options = [
        {value: '1', label: 'Option 1'},
        {value: '2', label: 'Option 2'},
        {value: '3', label: 'Option 3'},
        {value: '4', label: 'Option 4'},
        ];
    });
  </script>
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
    input, select {
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

<form method="POST">
    <label>
        Aftenskole
        <select bind:value={aftenskole}>
          <option value="">Vælg skole</option>
          {#each options as option (option.value)}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </label>
    <label>
        Postnummer
        <input name="zip_code" type="number">
    </label>
    <label>
        City
        <input name="city" type="text">
    </label>
    <label>
        Vejnavn
        <input name="street_name" type="text">
    </label>
    <label>
        Nr.
        <input name="street_number" type="number">
    </label>
    <button>Opret</button>
</form>