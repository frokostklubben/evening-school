import Router from 'express'
const router = Router()
import Classroom from '../database/models/classroom.js'
import Classroom_purpose from '../database/models/classroomPurpose.js'
import Inventory from '../database/models/inventory.js'
import { adminCheck } from '../middlewares/authMiddleware.js'
import { Op } from 'sequelize'
import connection from '../database/database.js'
import Booking from '../database/models/booking.js'

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

    // Retrieves inventory details for each classroom by collecting room_ids
    let roomIds = classrooms.map(classroom => classroom.room_id)
    // Finding records in the Classroom_inventory model that match these room_ids.

    const classroomInventories = await Classroom.findAll({
      where: { room_id: { [Op.in]: roomIds } },
      include: [
        { model: Inventory },
        {
          model: Classroom_purpose,
          attributes: ['purpose'],
        },
      ],
    })

    let formattedClassrooms = classroomInventories.map(classroom => {
      return {
        room_id: classroom.room_id,
        room_name: classroom.room_name,
        location_id: classroom.location_id,
        capacity: classroom.capacity,
        purpose: classroom.classroom_purpose.purpose,
        inventories: classroom.Inventories.map(inventory => {
          return inventory.item_name
        }),
      }
    })

    res.send({ data: formattedClassrooms })
  } catch (error) {
    console.error('Error fetching classrooms for location:', error)
    res.status(500).send({ error: 'Failed to fetch classrooms' })
  }
})

router.post('/api/classrooms', adminCheck, async (req, res) => {
  const { location_id, purpose, capacity, inventories, room_name } = req.body

  const transaction = await connection.transaction()

  try {
    const newClassroom = await Classroom.create(
      {
        location_id,
        capacity,
        room_name,
      },
      { transaction },
    )

    let newPurpose
    if (purpose) {
      newPurpose = await Classroom_purpose.create({ purpose: purpose }, { transaction })
      await newClassroom.setClassroom_purpose(newPurpose, { transaction })
    }

    // Oprette alle inventarobjekterne i en batch-operation, hvilket kan reducere overhead og forbedre ydeevnen:
    let newInventories = []
    if (inventories) {
      const inventoryItems = inventories.split(',').map(item => ({
        item_name: item.trim(),
      }))
      newInventories = await Inventory.bulkCreate(inventoryItems, { transaction })
      await newClassroom.addInventories(newInventories, { transaction })
    }

    await transaction.commit()

    // This approach ensures the classroom and all associated data are fetched together once the transaction is committed.
    const completeClassroom = await Classroom.findByPk(newClassroom.room_id, {
      include: [
        { model: Classroom_purpose, attributes: ['purpose'] },
        { model: Inventory, attributes: ['item_name'] },
      ],
    })

    let classroom = {
      room_id: completeClassroom.room_id,
      room_name: completeClassroom.room_name,
      location_id: completeClassroom.location_id,
      capacity: completeClassroom.capacity,
      purpose: completeClassroom.classroom_purpose.purpose, // directly assign the purpose value
      inventories: completeClassroom.Inventories.map(inventory => {
        return inventory.item_name
      }),
    }

    res.status(200).send({ data: classroom })
  } catch (error) {
    await transaction.rollback()
    res.status(500).send({ error: 'Failed to create classroom', details: error.message })
  }
})

router.patch('/api/classrooms/:roomId', adminCheck, async (req, res) => {
  const { roomId } = req.params
  const { location_id, purpose, capacity, inventories, room_name } = req.body

  if (capacity === undefined || capacity === null) {
    return res.status(400).send({ message: 'Kapacitet skal udfyldes' })
  }

  if (!room_name) {
    return res.status(400).send({ message: 'Navn på lokalet skal defineres' })
  }

  try {
    const classroom = await Classroom.findByPk(roomId)

    if (classroom) {
      await classroom.update({ location_id, capacity, room_name })

      let classroomPurpose = await Classroom_purpose.findOne({ where: { purpose: purpose } })
      if (!classroomPurpose) {
        classroomPurpose = await Classroom_purpose.create({ purpose })
      }

      await classroom.setClassroom_purpose(classroomPurpose)

      const oldInventories = await classroom.getInventories()
      await classroom.removeInventories(oldInventories)

      if (inventories && typeof inventories === 'string' && inventories.trim().length > 0) {
        const inventoryItems = inventories.split(',').map(item => ({ item_name: item.trim() }))
        const newInventories = await Inventory.bulkCreate(inventoryItems)
        await classroom.addInventories(newInventories)
      }

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
  const transaction = await connection.transaction()

  try {
    const classroom = await Classroom.findByPk(roomId, { transaction })

    if (classroom) {
      // Check for active bookings
      const activeBookings = await Booking.findAll({ where: { room_id: roomId }, transaction })
      if (activeBookings && activeBookings.length > 0) {
        await transaction.rollback()

        return res.status(400).send({ message: 'Cannot delete classroom with active bookings.' })
      }

      const inventories = await classroom.getInventories({ transaction })

      const purpose = await classroom.getClassroom_purpose({ transaction })

      if (purpose && purpose.length > 0) {
        for (let p of purpose) {
          await p.destroy({ transaction })
        }
      }

      if (inventories && inventories.length > 0) {
        for (let inventory of inventories) {
          await inventory.destroy({ transaction })
        }
      }

      await classroom.destroy({ transaction })

      await transaction.commit()

      res.send({ message: 'Classroom, its purpose and inventories deleted successfully.' })
    } else {
      await transaction.rollback()
      res.status(404).send({ message: 'Classroom not found.' })
    }
  } catch (error) {
    await transaction.rollback()
    console.error('Server Error:', error)
    res.status(500).send({ message: 'Server error while deleting classroom, its purpose and inventories.' })
  }
})

export default router
