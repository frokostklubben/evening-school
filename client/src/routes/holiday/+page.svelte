<script>
    import { onMount } from 'svelte';
    import ListItems from '../../components/ListItems.svelte';
    import { BASE_URL } from '../../stores/apiConfig.js';
    import { itemList } from '../../stores/itemListStore.js';
    import { displayNames } from '../../stores/dictionaryStore.js';
    import ModalAdd from '../../components/ModalAdd.svelte'
    import { optionId, showAddModal } from '../../stores/modalStore.js'
    import { Button } from 'flowbite-svelte';

    onMount(async () => {

        itemList.set([])

        const response = await fetch(`${$BASE_URL}/holidays`, {
            credentials: 'include',
        })
        if (response.ok) {
            let result = await response.json()
            
            let modifiedResult = result.data.map((item) => {
                let startDate = new Date(item.start_date);
                let endDate = new Date(item.end_date);
                return {
                    holiday_id: item.holiday_id,
                    name: item.name,
                    start_date: startDate.toISOString().split('T')[0],
                    end_date: endDate.toISOString().split('T')[0]
                }
            })

            itemList.set(modifiedResult)
        } else {
            console.error('Failed to fetch holidays')
        }
    
        displayNames.set({
            name: 'navn',
            start_date: 'startdato',
            end_date: 'slutdato'
        })

        //bruges i modalen, men har her ingen effekt
        optionId.set(1)
    })

    function addItem() {
		showAddModal.set(true);
	}

</script>

<div class="pt-3">
    <div class="text-center">
        <Button style="margin-top: 6px;" type="submit" color="green" on:click={addItem}
            >Ny helligdag/ferie</Button
        >
    </div>

    {#if $showAddModal}
        <ModalAdd collection={"holidays"} idKey={"holiday_id"} modalTitle={"Ferie eller helligdag" } />
    {/if}

    <ListItems idKey={"holiday_id"} collection={"holidays"} showCoursesButton={false} />
</div>