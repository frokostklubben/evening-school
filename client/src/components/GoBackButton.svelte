<script>
	import { titleStore } from '../stores/titleStore.js';

	function goBack() {
		const previousTitle = titleStore.goBack();
		titleStore.set(previousTitle);
		window.history.back();
	}
</script>

<button class="minimalist" title="Gå tilbage" on:click={goBack}>&larr;</button>

<style>
	.minimalist {
		background: none;
		border: none;
		font-size: 2em;
	}
</style>
