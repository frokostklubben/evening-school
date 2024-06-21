import Classroom_purpose from '../database/models/classroomPurpose.js'
import Classroom from '../database/models/classroom.js'
import Inventory from '../database/models/inventory.js'
import connection from '../database/database.js'
import { Op } from 'sequelize'

export async function handleClassroom({ location_id, purpose, capacity, inventories, room_name, transaction, classroom }) {
  if (!classroom) {
    const existingClassroom = await Classroom.findOne({ where: { room_name, location_id }, transaction })
    if (existingClassroom) {
      throw new Error(`Classroom with room_name "${room_name}" already exists.`)
    }

    classroom = await Classroom.create(
      {
        location_id,
        capacity,
        room_name,
      },
      { transaction },
    )
  } else {
    // Check if room_name already exists for update
    const existingClassroom = await Classroom.findOne({ where: { room_name, location_id, room_id: { [Op.ne]: classroom.room_id } }, transaction })
    if (existingClassroom) {
      throw new Error(`Classroom with room_name "${room_name}" already exists.`)
    }
    const updateData = { location_id, capacity, room_name }
    await classroom.update(updateData, { transaction })
  }
  const { purpose: newPurpose, inventories: newInventories } = await handleInventoriesAndPurpose(classroom, purpose, inventories, transaction)

  return {
    classroom,
    newPurpose,
    newInventories,
  }
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
}

export async function handleInventoriesAndPurpose(classroom, purpose, inventories, transaction) {
  if (!purpose) {
    purpose = 'Intet formål'
  }

  let existingPurpose = await Classroom_purpose.findOne({
    // made with chatgpt, marcus - to compare a lower case purpose with the database
    where: connection.where(connection.fn('LOWER', connection.col('purpose')), 'LIKE', '%' + purpose.toLowerCase() + '%'),
    transaction,
  })

  let newPurpose
  if (existingPurpose) {
    newPurpose = existingPurpose
  } else {
    newPurpose = await Classroom_purpose.create({ purpose: purpose }, { transaction })
  }
  await classroom.setClassroom_purpose(newPurpose, { transaction })

  let updatedInventories = []
  let originalCaseInventories = []

  if (inventories && typeof inventories === 'string' && inventories.trim() !== '') {
    const inventoryItems = inventories.split(',').map(item => item.trim())
    const lowerCaseInventoryItems = inventoryItems.map(item => item.toLowerCase())

    const currentInventories = await classroom.getInventories({ transaction })
    const inventoriesToRemove = currentInventories.filter(inv => !lowerCaseInventoryItems.includes(inv.item_name.toLowerCase()))

    // Remove inventories that are not in the new inventoryItems list
    if (inventoriesToRemove.length > 0) {
      await classroom.removeInventories(inventoriesToRemove, { transaction })

      // Check if removed inventories are used by other classrooms, destroy if not
      for (const inv of inventoriesToRemove) {
        const inventoryInUse = await Inventory.findOne({
          where: { item_name: inv.item_name },
          include: [
            {
              model: Classroom,
              through: { attributes: [] },
            },
          ],
          transaction,
        })

        if (!inventoryInUse || inventoryInUse.Classrooms.length === 0) {
          await inv.destroy({ transaction })
        }
      }
    }

    let existingInventories = await Inventory.findAll({
      where: {
        item_name: {
          [Op.in]: lowerCaseInventoryItems,
        },
      },
      transaction,
    })

    const existingInventoryNames = existingInventories.map(inv => inv.item_name.toLowerCase())
    const newInventoryItems = inventoryItems.filter(item => !existingInventoryNames.includes(item.toLowerCase()))

    // Create new inventories for the items that do not already exist
    if (newInventoryItems.length > 0) {
      const newInventoryRecords = newInventoryItems.map(item => ({
        item_name: capitalizeFirstLetter(item),
      }))
      const createdInventories = await Inventory.bulkCreate(newInventoryRecords, { transaction })
      updatedInventories = [...existingInventories, ...createdInventories]
    } else {
      updatedInventories = existingInventories
    }

    await classroom.addInventories(updatedInventories, { transaction })
  } else {
    // If no inventories are provided, remove all current inventories
    const currentInventories = await classroom.getInventories({ transaction })
    if (currentInventories.length > 0) {
      await classroom.removeInventories(currentInventories, { transaction })

      // Check if removed inventories are used by other classrooms
      for (const inv of currentInventories) {
        const inventoryInUse = await Inventory.findOne({
          where: { item_name: inv.item_name },
          include: [
            {
              model: Classroom,
              through: { attributes: [] },
            },
          ],
          transaction,
        })

        if (!inventoryInUse || inventoryInUse.Classrooms.length === 0) {
          await inv.destroy({ transaction })
        }
      }
    }
    updatedInventories = []
  }

  updatedInventories = await classroom.getInventories({ transaction })

  // Return the inventories with original case, ensuring the first letter is capitalized if needed
  originalCaseInventories = updatedInventories.map(inv => {
    const originalCaseName = inventories
      ? inventories
          .split(',')
          .map(item => item.trim())
          .find(item => item.toLowerCase() === inv.item_name.toLowerCase())
      : inv.item_name
    return originalCaseName ? capitalizeFirstLetter(originalCaseName) : capitalizeFirstLetter(inv.item_name)
  })

  return {
    purpose: newPurpose,
    inventories: originalCaseInventories.join(', '),
  }
}
