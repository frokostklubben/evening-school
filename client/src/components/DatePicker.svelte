<script>
	import Datepicker from 'svelte-flatpickr';
	import 'flatpickr/dist/flatpickr.min.css';

	export let value = [];
	export let id;
	export let label;
	export let modeRange;

	function onDateChange(event) {
		if (modeRange) {
			value = event.detail[0];
		} else {
			value = event.detail[1];
		}
	}

	function formatDate(date) {
		date = new Date(date);

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

		return modeRange
			? `${days[date.getDay()]} ${date.getDate().toString().padStart(2, '0')}. ${months[date.getMonth()]} ${date.getFullYear()}`
			: `${date.getDate().toString().padStart(2, '0')}. ${months[date.getMonth()]} ${date.getFullYear()}`;
	}

	$: formattedDateRange = modeRange
		? value[0] && value[1]
			? `<strong>Fra:</strong> ${formatDate(value[0])} &nbsp;&nbsp;&nbsp; <strong>Til:</strong> ${formatDate(value[1])}`
			: 'Vælg startdato og slutdato'
		: value
			? `Valgt dato  ${formatDate(value)}`
			: `Vælg dato`;
</script>

<div class="datepicker-wrapper">
	<strong><label for={id}>{label}:</label></strong>
	<div class="selected-dates">
		<span>{@html formattedDateRange}</span>
	</div>
	<Datepicker
		bind:value
		{id}
		on:change={onDateChange}
		options={{
			enableTime: false,
			inline: true,
			dateFormat: 'Y-m-d',
			altFormat: 'D d/m/Y',
			altInput: true,
			altInputClass: 'invisible',
			mode: modeRange ? 'range' : 'single',
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
	.selected-dates {
		margin-bottom: 10px;
	}
	.selected-dates span {
		display: block;
		margin-top: 5px;
	}
</style>
