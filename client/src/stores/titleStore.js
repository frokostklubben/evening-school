import { writable, get } from 'svelte/store';

function createTitleStore() {
	const { subscribe, set, update } = writable('');
	let history = [];

	return {
		subscribe,
		set: (value) => {
			history.push(get(titleStore));
			set(value);
		},
		goBack: () => {
			if (history.length > 0) {
				const previousTitle = history.pop();
				set(previousTitle);
				return previousTitle;
			}
			return '';
		}
	};
}

export const titleStore = createTitleStore();
