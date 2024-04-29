<script>
    import SelectBoxOptions from "./SelectBoxOptions.svelte";
export let list   
export let label
export let options
export let selected 

</script>

<div class="container mt-5">
	<div class="row justify-content-center">
		<div class="col-12 col-md-8 col-lg-6">
			<h2 class="mb-4">Se alle kontoransatte ved valgte skole</h2>
			<SelectBoxOptions {label} {options} {selected} />
			{#if selected}
				{#if users.length > 0}
					<div class="list-group">
						{#each users as user}
							<div class="list-group-item d-flex justify-content-between align-items-center">
								{user.first_name}
								{user.last_name} <span>{user.email}</span>
								<span>
									<button class="btn" on:click={() => openEditModal(user)}>
										<i class="bi bi-pencil-square"></i>
									</button>
									<button class="btn" on:click={() => openDeleteConfirmModal(user)}>
										<i class="bi bi-trash-fill"></i>
									</button>
								</span>
							</div>
						{/each}
					</div>
				{:else}
					<div class="alert alert-warning" role="alert">
						Ingen brugere fundet for den valgte skole.
					</div>
				{/if}
			{/if}
		</div>
	</div>
</div>
