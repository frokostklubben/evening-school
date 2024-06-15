<script>
	import { user } from '../stores/userStore';
</script>

{#if $user.email}
	<div class="welcome-container">
		<h1>Velkommen til Aftenskolernes Booking System</h1>

		<div class="user-info">
			Du er logget ind som: {$user.email}
		</div>
	</div>
{/if}

<style>
	.welcome-container {
		text-align: center;
		margin-top: 10rem;
		font-family: Arial, sans-serif;
	}

	.user-info {
		margin-top: 20px;
		font-size: 18px;
		color: #555;
	}
</style>
