<script>
	import { onMount } from 'svelte';
	import { toast } from 'svelte-french-toast';
	import { goto } from '$app/navigation';
	import { AUTH_URL } from '../../stores/apiConfig';

	export let token;
	let newPassword = '';
	let confirmPassword = '';

	onMount(() => {
		const urlParams = new URLSearchParams(window.location.search);
		token = urlParams.get('token');
	});

	function isValidPassword(password) {
		// Password must be at least 6 characters long, contain letters, a number and a symbol
		const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/;
		return passwordRegex.test(password);
	}

	async function validateAndResetPassword() {
		if (newPassword !== confirmPassword) {
			toast.error('Kodeordene er ikke ens');
			return;
		}

		if (!isValidPassword(newPassword)) {
			toast.error(
				'Kodeordet skal være mindst 6 tegn langt, indeholde bogstaver, et tal og et tegn.'
			);
			return;
		}

		await resetPassword();
	}

	async function resetPassword() {
		try {
			const response = await fetch(`${$AUTH_URL}/auth/reset-password`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ token, newPassword })
			});

			if (!response.ok) {
				const result = await response.json();
				toast.error(`Fejl: ${result.data}`);
				return;
			}

			toast.success('Kodeordet er opdateret');
			setTimeout(() => {
				goto('/');
			}, 2000);
		} catch (error) {
			console.error(error);
			toast.error('Noget gik galt ved netværksanmodningen.');
		}
	}
</script>

<svelte:head>
	<title>Reset password</title>
</svelte:head>

<main class="d-flex align-items-center justify-content-center vh-100 py-3">
	<div class="container">
		<div class="row justify-content-center">
			<div class="col-md-6">
				<div class="card">
					<div class="card-body">
						<div class="text-center mb-4">
							<h2 class="h3 mb-3 font-weight-normal">Lav nyt kodeord</h2>
						</div>
						<form class="form-signin" on:submit|preventDefault={validateAndResetPassword}>
							<div class="form-group mb-3">
								<label for="newPassword" class="form-label">Nyt kodeord</label>
								<input
									type="password"
									id="newPassword"
									name="newPassword"
									class="form-control"
									required
									bind:value={newPassword}
								/>
							</div>
							<div class="form-group mb-3">
								<label for="confirmPassword" class="form-label">Bekræft kodeord</label>
								<input
									type="password"
									id="confirmPassword"
									name="confirmPassword"
									class="form-control"
									required
									bind:value={confirmPassword}
								/>
							</div>
							<div class="form-group text-center">
								<button class="btn btn-primary" type="submit" style="width: 50%;">Gem</button>
							</div>
						</form>
						<div class="alert alert-warning mt-5" role="alert">
							Lav et stærkt kodeord med min. 6 tegn, skal indeholde bogstaver, et tal og et tegn.
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</main>
