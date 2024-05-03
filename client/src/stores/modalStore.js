import { writable } from 'svelte/store';

export let showEditModal = writable(false);

export let showDeleteModal = writable(false);

export let showAddModal = writable(false);

export let selectedItem = writable({});

export let optionId = writable('');