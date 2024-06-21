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

async function removeUnusedInventories(classroom, inventoriesToRemove, transaction) {
  await classroom.removeInventories(inventoriesToRemove, { transaction })

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

export async function handleInventoriesAndPurpose(classroom, purpose, inventories, transaction) {
  if (!purpose) {
    purpose = 'Intet formål'
  }

  let existingPurpose = await Classroom_purpose.findOne({
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

    if (inventoriesToRemove.length > 0) {
      await removeUnusedInventories(classroom, inventoriesToRemove, transaction)
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
    const currentInventories = await classroom.getInventories({ transaction })
    if (currentInventories.length > 0) {
      await removeUnusedInventories(classroom, currentInventories, transaction)
    }
    updatedInventories = []
  }

  updatedInventories = await classroom.getInventories({ transaction })

  originalCaseInventories = updatedInventories.map(inv => {
    const originalCaseName = inventories
      ? inventories
          .split(',')
          .map(item => item.trim())
          .find(item => item.toLowerCase() === inv.item_name.toLowerCase())
      : inv.item_name

    return capitalizeFirstLetter(originalCaseName)
  })

  return {
    purpose: newPurpose,
    inventories: originalCaseInventories.join(', '),
  }
}
