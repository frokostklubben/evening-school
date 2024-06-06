<script>
	import { user } from '../stores/userStore';
</script>

<div class="container">
	<div class="header">Velkommen til Aftenskolernes booking system</div>

	{#if $user.email}
		<div class="user-info">
			Du er logget ind som: {$user.email}
		</div>
	{/if}
</div>

<style>
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 40px;
		text-align: center;
		font-family: Arial, sans-serif;
	}
	.header {
		font-size: 28px;
		margin-bottom: 20px;
	}
	.user-info {
		margin-bottom: 20px;
		font-size: 18px;
	}
</style>
