import { writable } from 'svelte/store';

export let showEditModal = writable(false);

export let showDeleteModal = writable(false);

export let selectedItem = writable({});
