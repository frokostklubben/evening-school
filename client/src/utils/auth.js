import { get } from 'svelte/store';
import { AUTH_URL } from '../stores/apiConfig.js';
import { goto } from '$app/navigation';
import { isLoading, loginLoading } from '../stores/generalStore.js';
import { user, newUser } from '../stores/userStore.js';
import { toast } from 'svelte-french-toast';

export async function validateSession() {
	if (localStorage.getItem('sid')) {
		try {
			const sid = localStorage.getItem('sid');
			const response = await fetch(`${get(AUTH_URL)}/auth/validateSession`, {
				method: 'POST',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ sid })
			});

			if (response.ok) {
				const result = await response.json();
				user.set(result.data);
			} else {
				localStorage.removeItem('sid');
				goto('/');
			}
		} catch (error) {
			console.error(error);
		} finally {
			isLoading.set(false);
		}
	} else {
		isLoading.set(false);
	}
}

export async function validateServerSession(sid) {
	if (!sid) return null;

	try {
		const response = await fetch(`${get(AUTH_URL)}/auth/validateSession`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ sid })
		});

		if (response.ok) {
			const result = await response.json();
			return result.data;
		} else {
			return null;
		}
	} catch (error) {
		console.error(error);
		return null;
	}
}

export async function logout() {
	loginLoading.set(true);
	user.set({});
	localStorage.removeItem('sid');
	goto('/');
	try {
		const response = await fetch(`${get(AUTH_URL)}/auth/logout`, {
			credentials: 'include'
		});

		if (!response.ok) {
			toast.error('Fejl ved logud, kontakt admin');
		}
	} catch (error) {
		console.error(error.message);
	} finally {
		loginLoading.set(false);
	}
}

export async function login() {
	loginLoading.set(true);
	try {
		const response = await fetch(`${get(AUTH_URL)}/auth/login`, {
			credentials: 'include',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(get(newUser))
		});

		if (response.ok) {
			const result = await response.json();
			user.set(result.data);
			localStorage.setItem('sid', result.session);

			newUser.set = {};

			goto('/');
		} else {
			toast.error('Fejl ved login');
		}
	} catch (error) {
		console.error('Error login:', error);
		toast.error('Fejl ved login:', error.message);
	} finally {
		loginLoading.set(false);
	}
}
