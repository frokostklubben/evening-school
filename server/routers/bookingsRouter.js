import Router from 'express'
const router = Router()

import Booking from '../database/models/booking.js'

router.get('/api/bookings', async (req, res) => {
    const bookings = await Booking.findAll()
    res.send({ data: bookings })
})

router.post('/api/bookings', async (req, res) => {
    const { courseId, roomId, timeSlotId, date } = req.body

    try {
        await Booking.create({
            course_id: courseId,
            room_id: roomId,
            time_slot_id: timeSlotId,
            date,
        })

        res.status(200).send({ data: 'Booking was created' })
    } catch (error) {
        res.status(500).send({ data: 'Booking could not be created' })
    }
})

export default router