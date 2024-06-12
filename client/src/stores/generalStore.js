import { writable } from 'svelte/store';

export let isLoading = writable(true);

export let loginLoading = writable(false)

export let selectionsLoading = writable(false)

export let secondSelectionsLoading = writable(false)

export let contentLoading = writable(false)
