import Router from 'express'
const router = Router()
import Booking from '../database/models/booking.js'
import Classroom from '../database/models/classroom.js'
import Course from '../database/models/course.js'
import Teacher from '../database/models/teacher.js'
import Location from '../database/models/location.js'

router.get('/api/bookings', async (req, res) => {
  try {
    let school_id = req.session.user.schoolId

    let filteredBookings
    const bookings = await Booking.findAll({
      include: [
        {
          model: Classroom,
          include: [
            {
              model: Location,
              where: {
                school_id: school_id,
              },
            },
          ],
        },
        {
          model: Course,
          include: [
            {
              model: Teacher,
            },
          ],
        },
      ],
    })

    filteredBookings = bookings.map(booking => {
      booking = booking.toJSON()

      let formattedBooking = {}
      formattedBooking.bookingId = booking.booking_id
      formattedBooking.courseId = booking.course_id
      formattedBooking.date = booking.date
      formattedBooking.courseName = booking.Course.course_name
      formattedBooking.startTime = booking.start_time
      formattedBooking.endTime = booking.end_time
      formattedBooking.roomName = booking.Classroom.room_name
      formattedBooking.teacherEmail = booking.Course.Teacher.email

      formattedBooking.roomId = booking.room_id
      formattedBooking.teacherId = booking.Course.teacher_id
      formattedBooking.locationId = booking.Classroom.location_id

      formattedBooking.locationName = booking.Classroom.Location.school_name
      return formattedBooking
    })

    res.status(200).send({ data: filteredBookings })
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
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

// History for bookings to a course
router.get('/api/bookings/:courseId/course-history', async (req, res) => {
  try {
    let courseId = req.params.courseId

    let bookings = await Booking.findAll({
      where: { course_id: courseId },
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
})

router.patch('/api/bookings/:bookingId', async (req, res) => {
  const { bookingId } = req.params
  const { teacherId, roomId, locationId, date, startTime, endTime } = req.body

  try {
    const [updated] = await Booking.update(
      {
        teacher_id: teacherId,
        room_id: roomId,
        location_id: locationId,
        date,
        start_time: startTime,
        end_time: endTime,
      },
      {
        where: { booking_id: bookingId },
      },
    )

    if (!updated) {
      throw new Error('Failed to update booking')
    }

    // Get the updated booking
    const booking = await Booking.findOne({
      where: { booking_id: bookingId },
      include: [
        {
          model: Classroom,
          include: [
            {
              model: Location,
            },
          ],
        },
        {
          model: Course,
          include: [
            {
              model: Teacher,
            },
          ],
        },
      ],
    })

    const formattedBooking = {
      bookingId: booking.booking_id,
      courseId: booking.course_id,
      date: booking.date,
      courseName: booking.Course.course_name,
      endTime: booking.end_time,
      locationId: booking.Classroom.Location.location_id,
      locationName: booking.Classroom.Location.school_name,
      roomId: booking.room_id,
      roomName: booking.Classroom.room_name,
      startTime: booking.start_time,
      teacherEmail: booking.Course.Teacher.email,
      teacherId: booking.Course.teacher_id,
    }

    res.status(200).send({ data: formattedBooking })
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
})

router.delete('/api/bookings/:bookingId', async (req, res) => {
  const { bookingId } = req.params

  try {
    const deleted = await Booking.destroy({
      where: { booking_id: bookingId },
    })

    if (!deleted) {
      throw new Error('Failed to delete booking')
    }

    res.status(200).send({ data: 'Booking was deleted' })
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
})
export default router
