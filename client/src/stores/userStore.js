import { writable } from 'svelte/store';

export let user = writable({});

export let newUser = writable({
	email: 'admin@jensen.dk',
	password: '1'
});
