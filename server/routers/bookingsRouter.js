import Router from 'express'
const router = Router()
import Booking from '../database/models/booking.js'
import Classroom from '../database/models/classroom.js'
import Course from '../database/models/course.js'
import Teacher from '../database/models/teacher.js'

router.get('/api/bookings', async (req, res) => {
  const bookings = await Booking.findAll()
  res.send({ data: bookings })
})

// History for bookings to a classroom
router.get('/api/bookings/:roomId/room-history', async (req, res) => {
  try {
    let roomId = req.params.roomId

    let bookings = await Booking.findAll({
      where: { room_id: roomId },
    })
    // Add the classroom, course and teacher information to the bookings
    bookings = bookings.map(async booking => {
      booking = booking.toJSON()

      let course = await Course.findOne({
        where: { course_id: booking.course_id },
      })

      let teacher = await Teacher.findOne({
        where: { teacher_id: course.teacher_id },
      })

      booking.course_name = course.course_name
      booking.teacher_name = teacher.first_name + ' ' + teacher.last_name
      return booking
    })

    bookings = await Promise.all(bookings)

    res.status(200).send({
      data: bookings,
    })
  } catch (err) {
    console.log(err)
    res.status(500).send({ error: 'Failed to get room history' })
  }
})

router.get('/api/bookings/:courseId/course-history', async (req, res) => {
  try {
    let courseId = req.params.courseId

    let bookings = await Booking.findAll({
      where: {
        course_id: courseId,
        booking_date: {
          [Op.It]: today, // [Op.lt]: today part will filter out bookings where the booking date is less than (i.e., before) today's date.
        },
      },
    })

    // Map over the bookings to get the room ids
    let roomIds = bookings.map(booking => booking.room_id)

    let classrooms = await Classroom.findAll({
      where: { room_id: roomIds },
    })

    let course = await Course.findOne({
      where: { course_id: courseId },
    })

    let teacher = await Teacher.findOne({
      where: { teacher_id: course.teacher_id },
    })

    // Add the classroom, course and teacher information to the bookings
    bookings = bookings.map(booking => {
      booking = booking.toJSON()

      let classroom = classrooms.find(classroom => classroom.room_id === booking.room_id)

      // properties in the desired order
      return {
        room_name: classroom.room_name,
        start_time: booking.start_time,
        end_time: booking.end_time,
        date: booking.date,
        teacher_name: teacher.first_name + ' ' + teacher.last_name,
      }
    })

    res.status(200).send({
      data: bookings,
    })
  } catch (err) {
    console.log(err)
    res.status(500).send({ error: 'Failed to get room history' })
  }
})

// Endpoints for the history of a course's bookings with sequelize include:

// router.get('/api/bookings/:courseId/room-history', async (req, res) => {
//   try {
//     let courseId = req.params.courseId

//     let bookings = await Booking.findAll({
//       where: { course_id: courseId },
//       include: [Classroom],
//     })

//     res.status(200).send({
//       data: bookings,
//     })
//   } catch (err) {
//     console.log(err)
//     res.status(500).send({ error: 'Failed to get room history' })
//   }
// })

router.post('/api/bookings', async (req, res) => {
  const bookingData = req.body

  const bookings = []

  for (const booking of bookingData) {
    const { course_id, room_id, startTime, endTime, date } = booking
    bookings.push({
      course_id,
      room_id,
      date,
      start_time: startTime,
      end_time: endTime,
    })
  }

  try {
    await Booking.bulkCreate(bookings)
    res.send({ data: 'Bookings were created', bookings })
  } catch (error) {
    res.status(500).send({ error: 'Failed to create bookings' })
  }
  try {
    await Booking.bulkCreate(bookings)
    res.send({ data: bookings })
  } catch (error) {
    res.status(500).send({ error: 'Failed to create bookings' })
  }
})

export default router
