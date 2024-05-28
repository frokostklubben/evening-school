<script>
	export let room;
	console.log(room);
</script>

<article>
	<h2>{room.room_name} ({room.school_name})</h2>
	<p>Kapacitet: {room.capacity}</p>
	<p>Formål: {room.purpose}</p>
	<p>Inventar:</p>
	<ul>
		{#each room.inventory as item}
			<li>{item}</li>
		{/each}
	</ul>
	<p>Ledige tider:</p>
	<ul>
		{#each room.availableDays as day}
			<li>{day.date}: Fra {day.startTime} til {day.endTime}</li>
		{/each}
	</ul>
</article>
