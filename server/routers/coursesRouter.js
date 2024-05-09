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

router.patch('/api/courses/:courseId', async (req, res) => {
  const { course_id, course_name, description, teacher_id } = req.body

  try {
    const course = await Course.findByPk(course_id)
    await course.update({
      course_name,
      description,
      teacher_id
    })

    res.status(200).send({ data: course_name })
  } catch (error) {
    console.error(error);
    res.status(500).send({ data: "Server error updating course" })
  }
})

router.post('/api/courses', async (req, res) => {
  const { course_name, description, teacher_id } = req.body

  try {
    await Course.create({
      course_name,
      description,
      teacher_id,
    })

    res.status(200).send({ data: 'Course was created' })
  } catch (error) {
    res.status(500).send({ data: 'course could not be created' })
  }
})

export default router
