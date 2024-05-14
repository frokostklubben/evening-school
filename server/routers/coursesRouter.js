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

/* router.get('/api/courses/:locationId', async (req, res) => {
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
}) */

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

/* router.get('/api/courses/:locationId', async (req, res) => {
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
  
   */

export default router
