<script>
	import Datepicker from 'svelte-flatpickr';
	import 'flatpickr/dist/flatpickr.min.css';
	import { toast } from 'svelte-french-toast';

	export let value;
	export let id;
	export let onTimeChange;
</script>

<Datepicker
	style="margin-left: 5px;"
	bind:value
	{id}
	on:change={onTimeChange}
	options={{
		enableTime: true,
		inline: true,
		time_24hr: true,
		minTime: '08:00',
		maxTime: '23:00',
		dateFormat: 'H:i',
		noCalendar: true,
		minuteIncrement: 15,
		defaultHour: 8,
		defaultMinute: 0,
		altInput: true,
		altInputClass: 'invisible'
	}}
/>
