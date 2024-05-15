import Router from 'express'
const router = Router()

import Booking from '../database/models/booking.js'

router.get('/api/bookings', async (req, res) => {
    const bookings = await Booking.findAll()
    res.send({ data: bookings })
})

router.post('/api/bookings', async (req, res) => {

    const bookingData = req.body;

    const bookings = [];

    for (const booking of bookingData) {
        const { course_id, room_id, startTime, endTime, date } = booking;
        bookings.push({
            course_id,
            room_id,
            date,
            start_time: startTime,
            end_time: endTime,
        });
    }

    try {
        await Booking.bulkCreate(bookings);
        res.send({ data: 'Bookings were created', bookings });
    } catch (error) {
        res.status(500).send({ error: 'Failed to create bookings' });
    }
})

export default router