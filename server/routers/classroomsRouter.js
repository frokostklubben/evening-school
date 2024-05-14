import Router from 'express'
const router = Router()
import Classroom from '../database/models/classroom.js'
import Classroom_purpose from '../database/models/classroomPurpose.js'
import { adminCheck } from '../middlewares/authMiddleware.js'

router.get('/api/classrooms', adminCheck, async (req, res) => {
  const classrooms = await Classroom.findAll()
  res.send({ data: classrooms })
})

router.get('/api/classrooms/:locationId', async (req, res) => {
  try {
    const locationId = req.params.locationId
    const classroom = await Classroom.findAll(locationId)

    if (classroom) {
      res.send({ data: classroom })
    } else {
      res.status(404).send({ error: 'Classroom not found' })
    }
  } catch (error) {
    console.error('Error fetching classroom:', error)
    res.status(500).send({ error: 'Failed to fetch classroom' })
  }
})

router.post('/api/classrooms', adminCheck, async (req, res) => {
  const { location_id, purpose_id, capacity } = req.body

  try {
    const newClassroom = await Classroom.create({
      location_id: location_id,
      purpose_id: purpose_id,
      capacity: capacity,
    })

    res.status(200).send({ data: newClassroom })
  } catch (error) {
    res.status(500).send({ error: 'Failed to create classroom' })
  }
})

router.patch('/api/classrooms/:roomId', adminCheck, async (req, res) => {
  const { roomId } = req.params
  const updates = req.body

  try {
    const classroom = await Classroom.findByPk(roomId)

    if (classroom) {
      await classroom.update(updates)
      res.send({ message: 'Classroom updated.', data: classroom })
    } else {
      res.status(404).send({ message: 'Classroom not found.' })
    }
  } catch (error) {
    console.error('Server Error:', error)
    res.status(500).send({ message: 'Server error while updating classroom.' })
  }
})

router.delete('/api/classrooms/:roomId', adminCheck, async (req, res) => {
  const { roomId } = req.params

  try {
    const classroom = await Classroom.findByPk(roomId)
    if (classroom) {
      await classroom.destroy()
      res.send({ message: 'Classroom deleted successfully.' })
    } else {
      res.status(404).send({ message: 'Classroom not found.' })
    }
  } catch (error) {
    console.error('Server Error:', error)
    res.status(500).send({ message: 'Server error while deleting classroom.' })
  }
})

export default router
