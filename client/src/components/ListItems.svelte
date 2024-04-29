<script>
	import SelectBoxOptions from './SelectBoxOptions.svelte';
	export let list;
	export let listName;

    let itemKey= ""
	let headerKeys = list.length > 0 ? Object.keys(list[0]) : [];
</script>

<div class="container mt-5">
	<div class="row justify-content-center">
		<div class="col-12 col-md-8 col-lg-6">
			<h2 class="mb-4">{listName}</h2>
			{#if list.length > 0}
				<div class="list-group">
					<table>
						<thead>
							<tr>
								{#each headerKeys as key (key)}
									<th>{key}</th>
								{/each}
							</tr>
						</thead>
						<tbody>
							{#each list as listItem (listItem[])}
                                <tr>
                                    {#each headerKeys as key (key)}
                                        <td>{listItem[key]}</td>
                                    {/each}
                                </tr>
                            {/each}
						</tbody>
					</table>

					<!--
							<div class="list-group-item d-flex justify-content-between align-items-center">
								{listItem.first_name}
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
                            -->
					<!--{/each}-->
				</div>
			{:else}
				<div class="alert alert-warning" role="alert">Ingen data</div>
			{/if}
		</div>
	</div>
</div>
