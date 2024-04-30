import { writable } from 'svelte/store';

export const BASE_URL = writable('http://localhost:8080/api');
