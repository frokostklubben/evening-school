<script>
	import Datepicker from 'svelte-flatpickr';
	import 'flatpickr/dist/flatpickr.min.css';
	import { toast } from 'svelte-french-toast';

	export let value;
	export let id;

	function onTimeChange(event) {
		value = event.detail[0];
	}
	/* 	
  TODO: implement this with a onSelected 
  if (event.detail[0] % 15 !== 0) {
			toast.error('Vennligst kun velg 15 minutters intervaller');
		} else {
			value = event.detail[0];
		}
	} */
</script>

<Datepicker
	style="margin-left: 5px;"
	bind:value
	{id}
	on:change={onTimeChange}
	options={{
		enableTime: true,
		inline: true,
		mode: 'range',
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
