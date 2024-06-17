export function formatTime(timeString) {
	const [hours, minutes] = timeString.split(':');
	return `${hours}:${minutes}`;
}

export function formatDate(dateString) {
	const options = { year: 'numeric', month: 'long', day: 'numeric' };
	return new Date(dateString).toLocaleDateString(undefined, options);
}
