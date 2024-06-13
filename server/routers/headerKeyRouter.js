import { Router } from 'express'
import User from '../database/models/user.js'
import Course from '../database/models/course.js'
import Location from '../database/models/location.js'
import School from '../database/models/school.js'
import Holiday from '../database/models/holiday.js'
import Classroom from '../database/models/classroom.js'
import Booking from '../database/models/booking.js'
import Inventory from '../database/models/inventory.js'
import Classroom_purpose from '../database/models/classroomPurpose.js'
import Teacher from '../database/models/teacher.js'

const router = Router()

router.get('/api/headerKey/:modelname', async (req, res) => {
  try {
    const model = req.params.modelname
    let columnNames = []

    switch (model) {
      case 'users':
        columnNames = Object.keys(User.getAttributes())
        break
      case 'courses':
        const courseAttributes = Object.keys(Course.getAttributes())
        columnNames = ['courseIdInclude', ...courseAttributes]
        break
      case 'locations':
        columnNames = Object.keys(Location.getAttributes())
        break
      case 'schools':
        columnNames = Object.keys(School.getAttributes())
        break
      case 'holidays':
        columnNames = Object.keys(Holiday.getAttributes())
        break
      case 'bookings':
        columnNames = Object.keys(Booking.getAttributes())
        break
      case 'inventories':
        columnNames = Object.keys(Inventory.getAttributes())
        break
      case 'edit-booking':
        columnNames = ['bookingId', 'courseId', 'courseName', 'roomName', 'teacherEmail', 'startTime', 'endTime', 'date', 'locationName']
        break
      case 'classrooms':
        const classroomAttributes = Object.keys(Classroom.getAttributes())
        const classroomPurposeAttributes = Object.keys(Classroom_purpose.getAttributes())
        columnNames = [...classroomAttributes, ...classroomPurposeAttributes, 'inventories']

        break
      case 'classrooms/available':
        classroomAttributes = Object.keys(Classroom.getAttributes())
        classroomPurposeAttributes = Object.keys(Classroom_purpose.getAttributes())
        classroomAttributes.push('school_name')
        columnNames = [...classroomAttributes, ...classroomPurposeAttributes, 'inventory']

        break
      case 'teachers':
        columnNames = Object.keys(Teacher.getAttributes())
        break

      default:
        throw new Error('Invalid model name')
    }

    res.send({ data: columnNames })
  } catch (error) {
    console.error('Error fetching headerKey:', error)
    res.status(500).send({ error: 'Failed to fetch headerKey' })
  }
})

export default router
