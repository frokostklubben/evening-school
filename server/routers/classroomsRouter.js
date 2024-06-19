import Router from 'express'
const router = Router()
import Classroom from '../database/models/classroom.js'
import Classroom_purpose from '../database/models/classroomPurpose.js'
import Inventory from '../database/models/inventory.js'
import { adminCheck } from '../middlewares/authMiddleware.js'
import { Op } from 'sequelize'
import connection from '../database/database.js'
import Booking from '../database/models/booking.js'
import Location from '../database/models/location.js'
import Holiday from '../database/models/holiday.js'

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
        purpose: classroom.classroom_purpose ? classroom.classroom_purpose.purpose : 'Intet formål',
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
  let { location_id, purpose, capacity, inventories, room_name } = req.body

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

    if (purpose === '' || purpose == undefined || purpose == null) {
      purpose = 'Intet formål'
    }

    let newPurpose = await Classroom_purpose.create({ purpose: purpose }, { transaction })
    await newClassroom.setClassroom_purpose(newPurpose, { transaction })

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
      purpose: completeClassroom.classroom_purpose.purpose,
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

router.patch('/api/classrooms/:roomId', async (req, res) => {
  const { roomId } = req.params
  let { location_id, purpose, capacity, inventories, room_name } = req.body

  if (capacity === undefined || capacity === null) {
    return res.status(400).send({ message: 'Kapacitet skal udfyldes' })
  }

  if (!room_name) {
    return res.status(400).send({ message: 'Navn på lokalet skal defineres' })
  }

  try {
    const classroom = await Classroom.findByPk(roomId)

    if (classroom) {
      const updateData = { location_id, capacity, room_name }

      // Only update the fields that are provided in the request body
      if (location_id !== undefined) {
        updateData.location_id = location_id
      }
      if (capacity !== undefined) {
        updateData.capacity = capacity
      }
      if (room_name !== undefined) {
        updateData.room_name = room_name
      }

      if (purpose === '' || purpose == undefined || purpose == null) {
        purpose = 'Intet formål'
      }

      await classroom.update(updateData)

      if (purpose !== undefined) {
        let classroomPurpose = await Classroom_purpose.findOne({ where: { purpose: purpose } })
        if (!classroomPurpose) {
          classroomPurpose = await Classroom_purpose.create({ purpose })
        }

        await classroom.setClassroom_purpose(classroomPurpose)
      }

      if (inventories !== undefined && typeof inventories === 'string' && inventories.trim().length > 0) {
        const oldInventories = await classroom.getInventories()
        await classroom.removeInventories(oldInventories)

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

/* router.patch('/api/classrooms/:roomId', async (req, res) => {
  const { roomId } = req.params
  let { location_id, purpose, capacity, inventories, room_name } = req.body

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

      if (purpose === '' || purpose == undefined || purpose == null) {
        purpose = 'Intet formål'
      }

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
}) */

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

// Uses a post to get the available classrooms for a given date and time range posted to the endpoint.
router.post('/api/classrooms/available/:school_id', async (req, res) => {
  try {
    const schoolId = req.params.school_id
    let { startDate, endDate, startTime, endTime } = req.body

    startDate = new Date(startDate)
    endDate = new Date(endDate)

    startDate = new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0))
    endDate = new Date(Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 0, 0, 0))

    const allClassrooms = await Classroom.findAll({
      include: [
        {
          model: Location,
          attributes: ['school_name'],
          where: { school_id: schoolId },
        },
        {
          model: Inventory,
          attributes: ['item_name'],
        },
        {
          model: Classroom_purpose,
          as: 'classroom_purpose',
          attributes: ['purpose'],
        },
      ],
    })

    const isSameDay = startDate.toISOString().split('T')[0] === endDate.toISOString().split('T')[0]

    // If date range:
    const whereConditions = {
      date: {
        [Op.between]: [startDate, endDate],
      },
      [Op.and]: [
        {
          [Op.or]: [
            {
              start_time: {
                [Op.between]: [startTime, endTime],
              },
            },
            {
              end_time: {
                [Op.between]: [startTime, endTime],
              },
            },
            {
              [Op.and]: [{ start_time: { [Op.lte]: startTime } }, { end_time: { [Op.gte]: endTime } }],
            },
          ],
        },
      ],
    }

    // If single day:
    if (isSameDay) {
      whereConditions[Op.and].push(
        {
          start_time: {
            [Op.gte]: startTime,
          },
        },
        {
          end_time: {
            [Op.lte]: endTime,
          },
        },
      )
    }

    const allBookings = await Booking.findAll({
      where: whereConditions,
    })

    const allHolidays = await Holiday.findAll({
      where: {
        school_id: schoolId,
        start_date: {
          [Op.lte]: endDate,
        },
        end_date: {
          [Op.gte]: startDate,
        },
      },
    })

    function isDateWithinHoliday(date, holiday) {
      const checkDate = new Date(date)
      const holidayStartDate = new Date(holiday.start_date)
      const holidayEndDate = new Date(holiday.end_date)

      return checkDate.toDateString() === holidayStartDate.toDateString() || (checkDate >= holidayStartDate && checkDate <= holidayEndDate)
    }

    function isDateDuringAnyHoliday(date, allHolidays) {
      return allHolidays.some(holiday => isDateWithinHoliday(date, holiday))
    }

    // The bookingsByClassroom object is a dictionary where the key is the room_id and the value is an array of bookings for that room.
    const bookingsByClassroom = allBookings.reduce((acc, booking) => {
      const roomId = booking.room_id
      if (!acc[roomId]) {
        acc[roomId] = []
      }
      acc[roomId].push({
        start_time: booking.start_time,
        end_time: booking.end_time,
        date: booking.date,
      })
      return acc
    }, {})

    const calculateFreeTimes = (bookings, startHour, endHour) => {
      const intervals = []
      const bookingsByDate = bookings.reduce((acc, booking) => {
        const dateStr = booking.date.toISOString().split('T')[0]
        if (!acc[dateStr]) acc[dateStr] = []
        acc[dateStr].push(booking)
        return acc
      }, {})

      const current = new Date(startDate)
      const end = new Date(endDate)

      while (current <= end) {
        const dateStr = current.toISOString().split('T')[0]
        const dayBookings = bookingsByDate[dateStr] || []
        dayBookings.sort((a, b) => a.start_time.localeCompare(b.start_time))

        let currentStart = startHour
        const dayIntervals = []

        dayBookings.forEach(booking => {
          if (currentStart < booking.start_time) {
            dayIntervals.push({ start: currentStart, end: booking.start_time })
          }
          currentStart = booking.end_time
        })

        if (currentStart < endHour) {
          dayIntervals.push({ start: currentStart, end: endHour })
        }

        intervals.push({ date: dateStr, times: dayIntervals })
        current.setDate(current.getDate() + 1)
      }

      return intervals
    }

    const classroomsWithAvailability = allClassrooms.map(classroom => {
      const roomId = classroom.room_id
      const bookings = bookingsByClassroom[roomId] || []
      let freeTimes

      if (bookings.length === 0) {
        freeTimes = []
        const current = new Date(startDate)
        const end = new Date(endDate)

        while (current <= end) {
          if (!isDateDuringAnyHoliday(current, allHolidays)) {
            const dateStr = current.toISOString().split('T')[0]
            freeTimes.push({
              date: dateStr,
              times: [{ start: startTime, end: endTime }],
            })
          }
          current.setDate(current.getDate() + 1)
        }
      } else {
        freeTimes = calculateFreeTimes(bookings, startTime, endTime)
      }

      return {
        room_id: roomId,
        room_name: classroom.room_name,
        capacity: classroom.capacity,
        school_name: classroom.Location.school_name,
        inventory: classroom.Inventories.map(item => item.item_name),
        purpose: classroom.classroom_purpose ? classroom.classroom_purpose.purpose : '',
        freeTimes,
      }
    })

    res.send({ data: classroomsWithAvailability })
  } catch (error) {
    console.error('Error fetching available classrooms:', error)
    res.status(500).send({ error: 'Failed to fetch available classrooms' })
  }
})

export default router
