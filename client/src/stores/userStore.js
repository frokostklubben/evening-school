import { writable } from 'svelte/store';

export let user = writable({});

export let newUser = writable({
	email: 'lars@mortensen.dk',
	password: '1'
});

// email: 'admin@jensen.dk',

// email: 'lars@mortensen.dk',
