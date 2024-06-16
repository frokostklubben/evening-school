import { BASE_URL } from '../stores/apiConfig.js';
import { get } from 'svelte/store';
import { bookingData } from '../stores/bookingStore.js';

export async function fetchBookingFormInfo() {
	const response = await fetch(`${get(BASE_URL)}/booking-form-info`, {
		credentials: 'include'
	});
	if (response.ok) {
		return await response.json();
	} else {
		throw new Error('Failed to fetch booking form info');
	}
}

export async function saveDraft(course) {
	const method = course.course_id ? 'PATCH' : 'POST';
	const url = course.course_id
		? `${get(BASE_URL)}/courses/${course.course_id}`
		: `${get(BASE_URL)}/courses`;

	const response = await fetch(url, {
		credentials: 'include',
		method: method,
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(course)
	});

	if (response.ok) {
		return await response.json();
	} else {
		throw new Error('Failed to save draft');
	}
}

export async function checkSingleBookingDate(booking) {
	try {
		const response = await fetch(`${get(BASE_URL)}/check-booking-dates`, {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ bookingDates: [booking] })
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || 'Failed to check booking date');
		}

		const result = await response.json();
		return result.data;
	} catch (error) {
		console.error('Error checking single booking date:', error);
		throw error;
	}
}

export async function checkBookingDates({ weeks, selectedDays, ignoreSetupTime }) {
	console.log('weeks', weeks);
	console.log('selectedDays', selectedDays);
	console.log('ignoreSetupTime', ignoreSetupTime);

	try {
		if (weeks < 1) {
			weeks = 1;
		}

		// Generate booking dates for the specified weeks
		const bookingDates = selectedDays
			.map((day) => {
				let bookings = [];
				let startDate = new Date(day.startDate);
				for (let i = 0; i < weeks; i++) {
					let booking = {
						date: new Date(startDate).toISOString().split('T')[0],
						startTime: day.startTime,
						endTime: day.endTime,
						room_id: day.room_id || null // Ensure room_id is included if expected by the backend
					};
					startDate.setDate(startDate.getDate() + 7);
					bookings.push(booking);
				}
				return bookings;
			})
			.flat();

		console.log('Sending bookingDates:', bookingDates);

		const response = await fetch(`${get(BASE_URL)}/check-booking-dates`, {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ bookingDates, ignoreSetupTime })
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || 'Failed to check booking dates');
		}

		const result = await response.json();
		console.log('Received result:', result);

		return result.data;
	} catch (error) {
		console.error('Error checking booking dates:', error);
		throw error;
	}
}

export async function saveBooking(checkedBookings, selectedCourse) {
	checkedBookings = checkedBookings.map(
		({ conflict, newDate, newStartTime, newEndTime, ...rest }) => ({
			...rest,
			course_id: selectedCourse
		})
	);
	try {
		const response = await fetch(`${get(BASE_URL)}/bookings`, {
			credentials: 'include',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(checkedBookings)
		});
		if (response.ok) {
			toast.success(
				`Booking oprettet på ${title} med ${checkedBookings.length} datoer over ${weeks} ${
					weeks > 1 ? 'uger' : 'uge'
				}`,
				{ duration: 7000 }
			);
			initializeData();
		}
	} catch (error) {
		console.error('Error saving booking:', error);
	}
}
