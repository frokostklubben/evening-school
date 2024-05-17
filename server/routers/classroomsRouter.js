import Router from 'express'
const router = Router()
import Classroom from '../database/models/classroom.js'
import Classroom_purpose from '../database/models/classroomPurpose.js'
import Inventory from '../database/models/inventory.js'
import Classroom_inventory from '../database/models/classroomInventory.js'
import { adminCheck } from '../middlewares/authMiddleware.js'
import { Op } from 'sequelize'

router.get('/api/classrooms', adminCheck, async (req, res) => {
  const classrooms = await Classroom.findAll()
  res.send({ data: classrooms })
})

router.get('/api/classrooms/:locationId', async (req, res) => {
  try {
    const locationId = req.params.locationId

    const classrooms = await Classroom.findAll({
      where: { location_id: locationId },
    })

    if (classrooms && classrooms.length > 0) {
      res.send({ data: classrooms })
    } else {
      res.status(404).send({ error: 'Classroom not found' })
    }
  } catch (error) {
    console.error('Error fetching classrooms:', error)
    res.status(500).send({ error: 'Failed to fetch classrooms' })
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

router.get('/api/classrooms/purposes/:locationId', async (req, res) => {
  try {
    const locationId = req.params.locationId

    const classrooms = await Classroom.findAll({
      where: { location_id: locationId },
    })

    let purposeIds = classrooms.map(classroom => classroom.purpose_id)

    const purposes = await Classroom_purpose.findAll({
      where: { purpose_id: { [Op.in]: purposeIds } },
    })

    // TODO: Forklare kode
    const purposeMap = purposes.reduce((map, purpose) => {
      map[purpose.purpose_id] = purpose.purpose
      return map
    }, {})

    let roomIds = classrooms.map(classroom => classroom.room_id)

    const classroomInventories = await Classroom_inventory.findAll({
      where: { room_id: { [Op.in]: roomIds } },
    })

    let inventoryIds = classroomInventories.map(ci => ci.inventory_id)

    const inventories = await Inventory.findAll({
      where: { inventory_id: { [Op.in]: inventoryIds } },
    })

    // TODO: Forklare kode
    const inventoryMap = classroomInventories.reduce((map, ci) => {
      if (!map[ci.room_id]) {
        map[ci.room_id] = []
      }
      const inventory = inventories.find(inv => inv.inventory_id === ci.inventory_id)
      if (inventory) {
        map[ci.room_id].push(inventory.item_name)
      }
      return map
    }, {})

    // Add purpose and inventory details to each classroom
    const classroomsWithInventoryAndPurpose = classrooms.map(classroom => ({
      ...classroom.dataValues,
      purpose: purposeMap[classroom.purpose_id],
      inventories: inventoryMap[classroom.room_id] || [],
    }))

    res.send({ data: classroomsWithInventoryAndPurpose })
  } catch (error) {
    console.error('Error fetching classrooms for location:', error)
    res.status(500).send({ error: 'Failed to fetch classrooms' })
  }
})

export default router
