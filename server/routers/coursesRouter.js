import Router from 'express'
const router = Router()
import Course from '../database/models/course.js'
import Classroom from '../database/models/classroom.js'
import Booking from '../database/models/booking.js'
import { adminCheck } from '../middlewares/authMiddleware.js'
import { Op } from 'sequelize'

router.get('/api/courses', adminCheck, async (req, res) => {
  const courses = await Course.findAll()
  res.send({ data: courses })
})

router.get('/api/courses/:locationId', async (req, res) => {
  try {
    const locationId = req.params.locationId

    const classrooms = await Classroom.findAll({
      where: { location_id: locationId },
    })

    let roomIds = classrooms.map(classroom => classroom.room_id)

    const bookings = await Booking.findAll({
      where: { room_id: { [Op.in]: roomIds } },
    })

    let courseIds = bookings.map(booking => booking.course_id)

    const courses = await Course.findAll({
      where: { course_id: { [Op.in]: courseIds } },
    })

    res.send({ data: courses })
  } catch (error) {
    console.error('Error fetching courses for location:', error)
    res.status(500).send({ error: 'Failed to fetch courses' })
  }
})

router.get('/api/courses/:locationId/:roomId', async (req, res) => {
  try {
    const roomId = req.params.roomId

    const bookings = await Booking.findAll({
      where: { room_id: roomId },
    })

    let courseIds = bookings.map(booking => booking.course_id)

    const courses = await Course.findAll({
      where: { course_id: { [Op.in]: courseIds } },
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
      teacher_id,
    })

    res.status(200).send({ data: course_name })
  } catch (error) {
    console.error(error)
    res.status(500).send({ data: 'Server error updating course' })
  }
})

router.post('/api/courses', async (req, res) => {
  const { course_name, description, teacher_id } = req.body

  try {
    let newCourse = await Course.create({
      course_name,
      description,
      teacher_id,
    })

    res.status(200).send({ data: newCourse })
  } catch (error) {
    res.status(500).send({ data: 'course could not be created' })
  }
})


router.delete('/api/courses/:courseId', async (req, res) => {
  const courseId = req.params.courseId
  console.log('courseId before try catch:', courseId);

  try {
    const course = await Course.findByPk(courseId)

    console.log('course found by id:', course);

    if (!course) {
      return res.status(404).send({ data: 'Course not found' })
    }

    await course.destroy()

    res.status(200).send({ data: 'Course deleted' })
  } catch (error) {
    console.error(error)
    res.status(500).send({ data: 'Server error deleting course' })
  }
})

export default router
