<script>
	import Datepicker from 'svelte-flatpickr';
	import 'flatpickr/dist/flatpickr.min.css';
	import { createEventDispatcher } from 'svelte';

	export let date = new Date();
	export let id;
	export let label;

	const dispatch = createEventDispatcher();

	function onDateChange(event) {
		date = event.detail[0];
		dispatch('dateChange', date);
	}

	function formatDate(date) {
		if (!(date instanceof Date)) return '';

		const days = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];
		const months = [
			'jan.',
			'feb.',
			'mar.',
			'april',
			'maj',
			'juni',
			'juli',
			'aug',
			'sept.',
			'okt.',
			'nov.',
			'dec.'
		];
		return `${days[date.getDay()]} ${date.getDate().toString().padStart(2, '0')}. ${months[date.getMonth()]} ${date.getFullYear()}`;
	}
	$: formattedDate = date ? formatDate(date) : 'Vælg dato og tid';
</script>

<div class="datepicker-wrapper">
	<strong><label for={id}>{label}:</label></strong>
	<div class="selected-date">
		<span>{date ? date.toLocaleDateString() : 'Vælg dato'}</span>
	</div>
	<Datepicker
		bind:value={date}
		{id}
		on:change={onDateChange}
		options={{
			enableTime: false,
			inline: true,
			dateFormat: 'Y-m-d',
			altFormat: 'D d/m/Y',
			altInput: true,
			altInputClass: 'invisible',
			time_24hr: true,
			minDate: 'today',
			minuteIncrement: 15,
			defaultHour: 8,
			defaultMinute: 0,
			locale: {
				firstDayOfWeek: 1
			},
			weekNumbers: true
		}}
	/>
</div>

<style>
	.datepicker-wrapper {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}
	.selected-date {
		margin-bottom: 10px;
	}
	.selected-date span {
		display: block;
		margin-top: 5px;
	}
</style>
