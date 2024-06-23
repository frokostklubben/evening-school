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
    const existingClassroom = await Classroom.findOne({ where: { room_name, location_id, room_id: { [Op.ne]: classroom.room_id } }, transaction })
    if (existingClassroom) {
      throw new Error(`Classroom with room_name "${room_name}" already exists.`)
    }
    const updateData = { location_id, capacity, room_name }
    await classroom.update(updateData, { transaction })
  }
  const newPurpose = await handlePurpose(classroom, purpose, transaction)
  const newInventories = await handleInventories(classroom, inventories, transaction)

  return {
    classroom,
    newPurpose,
    newInventories,
  }
}
async function handlePurpose(classroom, purpose, transaction) {
  if (!purpose || purpose.trim() === '') {
    let defaultPurpose = await Classroom_purpose.findOne({
      where: connection.where(connection.fn('LOWER', connection.col('purpose')), 'LIKE', '%intet formål%'),
      transaction,
    })

    if (!defaultPurpose) {
      defaultPurpose = await Classroom_purpose.create({ purpose: 'Intet formål' }, { transaction })
    }

    await classroom.setClassroom_purpose(defaultPurpose, { transaction })
    return defaultPurpose
  } else {
    let existingPurpose = await Classroom_purpose.findOne({
      where: connection.where(connection.fn('LOWER', connection.col('purpose')), 'LIKE', '%' + purpose.toLowerCase() + '%'),
      transaction,
    })

    if (!existingPurpose) {
      existingPurpose = await Classroom_purpose.create({ purpose: purpose }, { transaction })
    }

    await classroom.setClassroom_purpose(existingPurpose, { transaction })
    return existingPurpose
  }
}

async function handleInventories(classroom, inventories, transaction) {
  let updatedInventories = []
  if (typeof inventories === 'string' && inventories.trim() !== '') {
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
    updatedInventories = await classroom.getInventories({ transaction })
  }

  const originalCaseInventories = updatedInventories.map(inv => {
    const originalCaseName =
      typeof inventories === 'string'
        ? inventories
            .split(',')
            .map(item => item.trim())
            .find(item => item.toLowerCase() === inv.item_name.toLowerCase())
        : inv.item_name

    return capitalizeFirstLetter(originalCaseName)
  })

  return originalCaseInventories.join(', ')
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
