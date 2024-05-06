import Router from 'express'
const router = Router()
import Course from '../database/models/course.js'
import { adminCheck } from '../middlewares/authMiddleware.js'

router.get('/api/courses', adminCheck, async (req, res) => {
  const courses = await Course.findAll()
  res.send({ data: courses })
})

router.get('/api/courses/:locationId', async (req, res) => {
  try {
    const locationId = req.params.locationId

    const courses = await Course.findAll({
      where: { location_id: locationId },
    })

    res.send({ data: courses })
  } catch (error) {
    console.error('Error fetching courses for location:', error)
    res.status(500).send({ error: 'Failed to fetch courses' })
  }
})

export default router
