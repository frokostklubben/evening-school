import { Router } from 'express'
import User from '../database/models/user.js'
import Course from '../database/models/course.js'
import Location from '../database/models/location.js'
import School from '../database/models/school.js'
import Classroom from '../database/models/classroom.js'
import Booking from '../database/models/booking.js'
import Inventory from '../database/models/inventory.js'
import Classroom_inventory from '../database/models/classroomInventory.js'
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
        columnNames = Object.keys(Course.getAttributes())
        break
      case 'locations':
        columnNames = Object.keys(Location.getAttributes())
        break
      case 'schools':
        columnNames = Object.keys(School.getAttributes())
        break
      case 'classrooms':
        columnNames = Object.keys(Classroom.getAttributes())
        break
      case 'bookings':
        columnNames = Object.keys(Booking.getAttributes())
        break
      case 'inventories':
        columnNames = Object.keys(Inventory.getAttributes())
        break
      case 'classroom_inventories':
        columnNames = Object.keys(Classroom_inventory.getAttributes())
        break
      case 'classroom_purposes':
        columnNames = Object.keys(Classroom_purpose.getAttributes())
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
