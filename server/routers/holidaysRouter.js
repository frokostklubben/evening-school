import { Router } from 'express';
const router = Router();
import Holiday from '../database/models/holiday.js'



router.get('/api/holidays', async (req, res) => {
    try{
        const school_id = req.session.user.schoolId
        const holidays = await Holiday.findAll({ where: { school_id } })
        res.send({ data: holidays })
    } catch (error) {
        res.status(500).send({ error: 'Failed to fetch holidays' })
    }
})

router.post('/api/holidays', async (req, res) => {
    try {
        const school_id = req.session.user.schoolId
        const { name, start_date } = req.body
        let { end_date } = req.body
        
        //if end_date is not provided, set to start_date
        if (end_date === undefined) {
            end_date = start_date
        }

        //if end_date is before start_date, set to start_date
        if (end_date < start_date) {
            end_date = start_date
        }

        const holiday = await Holiday.create({ school_id, name, start_date, end_date })
        res.send({ data: holiday })
    } catch (error) {
        res.status(500).send({ error: 'Failed to create holiday' })
    }
})

router.patch('/api/holidays/:holidayId', async (req, res) => {
    try {
        const { holidayId } = req.params
        const updates = req.body
        const holiday = await Holiday.findByPk(holidayId)

        //if end_date is before start_date, return error
        if (updates.end_date < updates.start_date) {
            return res.status(500).send({ message: 'Check the dates.' })
        }

        if (holiday) {
            await holiday.update(updates)
            res.send({ message: 'Holiday updated.', data: holiday })
        } else {
            res.status(404).send({ message: 'Holiday not found.' })
        }
    } catch (error) {
        console.error('Server Error:', error)
        res.status(500).send({ message: 'Server error while updating holiday.' })
    }
})

router.delete('/api/holidays/:holidayId', async (req, res) => {
    try {
        const { holidayId } = req.params
        const holiday = await Holiday.findByPk(holidayId)

        if (holiday) {
            await holiday.destroy()
            res.send({ message: 'Holiday deleted.' })
        } else {
            res.status(404).send({ message: 'Holiday not found.' })
        }
    } catch (error) {
        console.error('Server Error:', error)
        res.status(500).send({ message: 'Server error while deleting holiday.' })
    }
})

export default router;