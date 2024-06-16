// src/stores/bookingStore.js
import { writable } from 'svelte/store';

export const bookingData = writable({
	title: '',
	description: '',
	selectedTeacher: 'empty',
	selectedCourse: 'empty',
	selectedLocation: 'empty',
	selectedClassroom: 'empty',
	selectedPurpose: 'empty',
	selectedDays: [],
	weeks: 1,
	checkedBookings: []
});

export let allInfoGiven = writable(false);
