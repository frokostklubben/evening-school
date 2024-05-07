import { get } from 'svelte/store';
import { AUTH_URL } from '../src/stores/apiConfig.js';

console.log('AUTH_URL:',get(AUTH_URL));

async function login() {

  try {
    const response = await fetch(`${$AUTH_URL}/auth/login`, {
      credentials: 'include',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newUser)
    });

    if (response.ok) {
      const result = await response.json();
      user.set(result.data);
      console.log($user);

      newUser.email = '';
      newUser.password = '';
      
    }
  } catch (error) {
    console.error('Error login:', error);
    // toast.error('Fejl ved login:', error.message);
  }
}

export { login };