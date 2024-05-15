import { writable } from 'svelte/store';

export let isLoading = writable(true);

export let loginLoading = writable(false)
