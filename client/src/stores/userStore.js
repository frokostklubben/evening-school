import { writable } from 'svelte/store';

export let user = writable({});

export let newUser = writable({
	email: 'lars@mortensen.dk',
	password: '1'
});
