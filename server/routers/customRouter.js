import { Router, response } from 'express'
import teacher from '../database/models/teacher.js'
import location from '../database/models/location.js'
import classroom from '../database/models/classroom.js'
import course from '../database/models/course.js'
import booking from '../database/models/booking.js'
import Holiday from '../database/models/holiday.js'
import { Op, literal } from 'sequelize'
import Booking from '../database/models/booking.js'
import Classroom_purpose from '../database/models/classroomPurpose.js'

const router = Router()

router.get('/api/booking-form-info', async (req, res) => {
  try {
    let school_id = req.session.user.schoolId

    let locations = await location.findAll({
      where: { school_id: school_id },
    })

    let locationIds = locations.map(location => location.location_id)

    let classrooms = await classroom.findAll({
      where: {
        location_id: {
          [Op.in]: locationIds,
        },
      },
      include: [
        {
          model: Classroom_purpose,
        },
      ],
    })

    let teachers = await teacher.findAll({
      where: { school_id: school_id },
    })

    let teacherIds = teachers.map(teacher => teacher.teacher_id)

    let courses = await course.findAll({
      where: {
        teacher_id: {
          [Op.in]: teacherIds,
        },
      },
    })

    let bookings = await booking.findAll({
      where: {
        course_id: {
          [Op.in]: courses.map(course => course.course_id),
        },
      },
    })

    //filter ther bookings to only one of each course_id
    let filteredBookings = []
    for (let i = 0; i < bookings.length; i++) {
      if (!filteredBookings.some(booking => booking.course_id === bookings[i].course_id)) {
        filteredBookings.push(bookings[i])
      }
    }

    // finding all the courses that dont have a booking
    let coursesWithoutBooking = courses.filter(course => {
      return !bookings.some(booking => booking.course_id === course.course_id)
    })

    res.status(200).send({
      data: {
        locations,
        classrooms,
        courses,
        teachers,
        coursesWithoutBooking,
        filteredBookings,
      },
    })
  } catch (err) {
    console.log(err)
    res.status(500).send({ error: 'Failed to get form info' })
  }
})

router.get('/api/edit-booking-form-info', async (req, res) => {
  try {
    let school_id = req.session.user.schoolId

    let locations = await location.findAll({
      where: { school_id: school_id },
      include: [
        {
          model: classroom,
          include: [
            {
              model: Classroom_purpose,
            },
          ],
        },
      ],
    })

    let teachers = await teacher.findAll({
      where: { school_id: school_id },
    })

    res.status(200).send({
      data: {
        locations,
        teachers,
      },
    })
  } catch (err) {
    console.log(err)
    res.status(500).send({ error: 'Failed to get form info' })
  }
})

router.post('/api/check-booking-dates', async (req, res) => {
  try {
    let { bookingDates, ignoreSetupTime } = req.body
    let school_id = req.session.user.schoolId

    // loop thought each booking date and check for conflicts
    for (let i = 0; i < bookingDates.length; i++) {
      //see if any holidays conflict with the booking date
      let holidayConflict = await Holiday.findOne({
        where: {
          [Op.and]: [{ school_id: school_id }, { start_date: { [Op.lte]: bookingDates[i].date } }, { end_date: { [Op.gte]: bookingDates[i].date } }],
        },
      })

      //no need to run the booking time conflict check if there is a holiday conflict
      if (holidayConflict !== null) {
        bookingDates[i].holidayConflict = holidayConflict
        bookingDates[i].conflict = true
        continue
      }

      //see if any bookings conflict with the booking date
      let bookingConflicts = await booking.findAll({
        where: {
          [Op.and]: [
            { date: bookingDates[i].date },
            { room_id: bookingDates[i].room_id },
            {
              [Op.or]: [
                {
                  start_time: ignoreSetupTime
                    ? { [Op.between]: [bookingDates[i].startTime, bookingDates[i].endTime] }
                    : {
                        [Op.between]: [bookingDates[i].startTime, new Date(new Date('1970/01/01 ' + bookingDates[i].endTime).getTime() + 15 * 60000).toTimeString().substring(0, 5)],
                      },
                },
                {
                  end_time: ignoreSetupTime
                    ? {
                        [Op.between]: [bookingDates[i].startTime, bookingDates[i].endTime],
                      }
                    : {
                        [Op.between]: [new Date(new Date('1970/01/01 ' + bookingDates[i].startTime).getTime() - 15 * 60000).toTimeString().substring(0, 5), bookingDates[i].endTime],
                      },
                },
              ],
            },
          ],
        },
      })

      //add a conflict bookings to the booking date object, if there is any conflicts
      if (bookingConflicts.length > 0) {
        bookingDates[i].conflict = true

        bookingDates[i].bookingConflicts = bookingConflicts
      } else {
        bookingDates[i].conflict = false
      }
    }

    res.status(200).send({ data: bookingDates })
  } catch (err) {
    console.log(err)
    res.status(500).send({ error: 'Failed to check booking dates' })
  }
})

export default router
