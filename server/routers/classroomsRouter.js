import Router from 'express'
const router = Router()
import Classroom from '../database/models/classroom.js'
import Classroom_purpose from '../database/models/classroomPurpose.js'
import Inventory from '../database/models/inventory.js'
import { adminCheck } from '../middlewares/authMiddleware.js'
import { Op } from 'sequelize'
import connection from '../database/database.js'

router.get('/api/classrooms', adminCheck, async (req, res) => {
  const classrooms = await Classroom.findAll()
  res.send({ data: classrooms })
})

// TODO: BRUGER NOGEN DENNE ROUTE?? Bruger user den?
// router.get('/api/classrooms/:locationId', async (req, res) => {
//   try {
//     const locationId = req.params.locationId

//     const classrooms = await Classroom.findAll({
//       where: { location_id: locationId },
//     })

//     if (classrooms && classrooms.length > 0) {
//       res.send({ data: classrooms })
//     } else {
//       res.status(404).send({ error: 'Classroom not found' })
//     }
//   } catch (error) {
//     console.error('Error fetching classrooms:', error)
//     res.status(500).send({ error: 'Failed to fetch classrooms' })
//   }
// })

// TODO: admincheck?
router.get('/api/classrooms/:locationId', async (req, res) => {
  try {
    const locationId = req.params.locationId

    const classrooms = await Classroom.findAll({
      where: { location_id: locationId },
    })

    //  Collects purpose_id from each classroom
    let purposeIds = classrooms.map(classroom => classroom.purpose_id)

    // Fetches all corresponding purposes from the Classroom_purpose model
    // Op.in operator: checks if the purpose_id of each record in the Classroom_purpose table is one of the values listed in the purposeIds array.
    const purposes = await Classroom_purpose.findAll({
      where: { purpose_id: { [Op.in]: purposeIds } },
    })

    // Uses the reduce method to create an object (purposeMap) where each key is a purpose_id and each value is the purpose
    // This mapping will make it easier to quickly find the purpose description by purpose_id.
    const purposeMap = purposes.reduce((map, purpose) => {
      map[purpose.purpose_id] = purpose.purpose
      return map
    }, {})

    // Retrieves inventory details for each classroom by collecting room_ids
    let roomIds = classrooms.map(classroom => classroom.room_id)
    // Finding records in the Classroom_inventory model that match these room_ids.

    const classroomInventories = await Classroom.findAll({
      where: { room_id: { [Op.in]: roomIds } },
      include: Inventory,
    })

    // Collects inventory_id from each classroom inventory record
    let inventoryIds = classroomInventories.map(ci => ci.inventory_id)
    // Fetches the corresponding inventory items
    const inventories = await Inventory.findAll({
      where: { inventory_id: { [Op.in]: inventoryIds } },
    })

    // Constructs an inventory map linking each room to its list of inventory items.
    // Uses reduce to create an object (inventoryMap) where each key is a room_id and the value is a list of inventory items associated with that room.
    const inventoryMap = classroomInventories.reduce((map, inventoryItem) => {
      // Check if the current room_id already has an initialized list in the map.
      if (!map[inventoryItem.room_id]) {
        map[inventoryItem.room_id] = [] // If not, initialize an empty list for this room_id.
      }
      // Find the corresponding inventory item using the inventory_id from classroomInventories
      const inventory = inventories.find(inv => inv.inventory_id === inventoryItem.inventory_id)
      // If a corresponding inventory item is found, add its name to the list associated with the room_id.
      if (inventory) {
        map[inventoryItem.room_id].push(inventory.item_name)
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

/* router.post('/api/classrooms', adminCheck, async (req, res) => {
  console.log('api/classrooms POST request received')

  const { location_id, purpose, capacity, inventory, room_name } = req.body

  try {
    const newClassroom = await Classroom.create({
      location_id: location_id,
      capacity: capacity,
      room_name: room_name,
    })

    // If a purpose is provided, create it and associate it with the Classroom
    if (purpose) {
      const newPurpose = await Classroom_purpose.create(purpose)
      console.log('<<<<<<<<<<<<<<<< newPurpose: ', newPurpose)

      await newClassroom.setPurpose(newPurpose)
    }

    // For each inventory item, create it and associate it with the Classroom
    // TODO: Check if this works with multiple inventory items separated by commas!
    // What about Classroom_inventory?
    for (let item of inventory) {
      const newInventory = await Inventory.create(item)
      await newClassroom.addInventory(newInventory)
    }

    res.status(200).send({ data: newClassroom })
  } catch (error) {
    res.status(500).send({ error: 'Failed to create classroom' })
  }
}) */

// endpoint with transaction:
router.post('/api/classrooms', adminCheck, async (req, res) => {
  const { location_id, purpose, capacity, inventories, room_name } = req.body

  console.log('inventory', inventories)

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

    if (purpose) {
      const newPurpose = await Classroom_purpose.create({ purpose: purpose }, { transaction })
      await newClassroom.setClassroom_purpose(newPurpose, { transaction })
    }

    if (inventories) {
      for (let item of inventories) {
        const newInventory = await Inventory.create({ item_name: item }, { transaction })
        await newClassroom.addInventory(newInventory, { transaction })
      }
    }

    await transaction.commit()
    res.status(200).send({ data: newClassroom })
  } catch (error) {
    await transaction.rollback()
    res.status(500).send({ error: 'Failed to create classroom', details: error.message })
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
