<script>
	import { user } from '../stores/userStore';
</script>

<h1>Forside</h1>

<span>Du er logget ind som: {$user.email}, med role id: {$user.roleId}</span>
<div>(1 = admin, 2 = kontoransat)</div>
