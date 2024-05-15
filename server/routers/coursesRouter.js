import Router from 'express'
const router = Router()
import Course from '../database/models/course.js'
import Classroom from '../database/models/classroom.js'
import Booking from '../database/models/booking.js'
import { adminCheck } from '../middlewares/authMiddleware.js'

router.get('/api/courses', adminCheck, async (req, res) => {
  const courses = await Course.findAll()
  res.send({ data: courses })
})

// TODO: change name? combined endpoint for courses and classrooms
router.get('/api/courses/:locationId', async (req, res) => {
  try {
    const locationId = req.params.locationId

    const classrooms = await Classroom.findAll({
      where: { location_id: locationId },
      include: [
        {
          model: Booking,
          include: [
            {
              model: Course,
              attributes: ['course_name', 'course_description'],
            },
          ],
        },
      ],
    })

    // Saml alle kurser fra de hentede klasserum
    const courses = classrooms.reduce((listOfCourses, classroom) => {
      classroom.Bookings.forEach(booking => {
        if (booking.Course) {
          listOfCourses.push(booking.Course)
        }
      })
      return listOfCourses
    }, [])

    // Send kun unikke kurser tilbage baseret på et kriterie, f.eks. kursusnavn
    // const uniqueCourses = [...new Map(courses.map(course => [course['course_name'], course])).values()]

    res.send({ data: listOfCourses })
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
