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
import { handleClassroom } from '../services/classroomService.js'

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
    const { classroom, newPurpose, newInventories } = await handleClassroom({
      location_id,
      purpose,
      capacity,
      inventories,
      room_name,
      transaction,
    })

    await transaction.commit()

    let responseClassroom = {
      room_id: classroom.room_id,
      room_name: classroom.room_name,
      location_id: classroom.location_id,
      capacity: classroom.capacity,
      purpose: newPurpose.purpose,
      inventories: newInventories,
    }

    res.status(200).send({ data: responseClassroom })
  } catch (error) {
    await transaction.rollback()
    console.error('Transaction error:', error.message)
    if (error.message.includes('already exists')) {
      res.status(400).send({ error: error.message })
    } else {
      res.status(500).send({ error: 'Failed to create classroom', details: error.message })
    }
  }
})

router.patch('/api/classrooms/:roomId', async (req, res) => {
  const { roomId } = req.params
  let { location_id, purpose, capacity, inventories, room_name } = req.body

  const transaction = await connection.transaction()

  try {
    const classroom = await Classroom.findByPk(roomId, { transaction })

    if (classroom) {
      const {
        classroom: updatedClassroom,
        newPurpose,
        newInventories,
      } = await handleClassroom({
        location_id,
        purpose,
        capacity,
        inventories,
        room_name,
        transaction,
        classroom,
      })

      await transaction.commit()

      let responseClassroom = {
        room_id: updatedClassroom.room_id,
        room_name: updatedClassroom.room_name,
        location_id: updatedClassroom.location_id,
        capacity: updatedClassroom.capacity,
        purpose: newPurpose ? newPurpose.purpose : null,
        inventories: newInventories,
      }

      res.send({ message: 'Classroom updated.', data: responseClassroom })
    } else {
      await transaction.rollback()
      res.status(404).send({ message: 'Classroom not found.' })
    }
  } catch (error) {
    await transaction.rollback()
    console.error('Server Error:', error.message)
    if (error.message.includes('already exists')) {
      res.status(400).send({ error: error.message })
    } else {
      res.status(500).send({ message: 'Server error while updating classroom.', details: error.message })
    }
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

      const purposeId = classroom.purpose_id
      // if purposeId is not defined, it sets purpose to null
      const purpose = purposeId ? await Classroom_purpose.findByPk(purposeId, { transaction }) : null

      // Remove classroom
      await classroom.destroy({ transaction })

      // Check if purpose is used by other classrooms
      if (purpose) {
        const otherClassroomsWithPurpose = await Classroom.findAll({
          where: { purpose_id: purposeId },
          transaction,
        })

        if (otherClassroomsWithPurpose.length === 0) {
          await purpose.destroy({ transaction })
        }
      }

      // Check if inventories are used by other classrooms
      if (inventories && inventories.length > 0) {
        for (let inventory of inventories) {
          const inventoryId = inventory.inventory_id
          if (inventoryId) {
            const otherClassroomsWithInventory = await Classroom.findAll({
              include: [
                {
                  model: Inventory,
                  where: { inventory_id: inventoryId },
                  through: { attributes: [] },
                },
              ],
              transaction,
            })

            if (otherClassroomsWithInventory.length === 0) {
              await inventory.destroy({ transaction })
            }
          }
        }
      }

      await transaction.commit()

      res.send({ message: 'Classroom deleted successfully.' })
    } else {
      await transaction.rollback()
      res.status(404).send({ message: 'Classroom not found.' })
    }
  } catch (error) {
    await transaction.rollback()
    console.error('Server Error:', error)
    res.status(500).send({ message: 'Server error while deleting classroom.' })
  }
})

// Uses a post to get the available classrooms for a given date and time range posted to the endpoint.
router.post('/api/classrooms/available/:school_id', async (req, res) => {
  try {
    const schoolId = req.params.school_id
    let { startDate, endDate, startTime, endTime } = req.body

    startDate = new Date(startDate)
    endDate = new Date(endDate)

    // Convert startDate and endDate to UTC at midnight
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

    // If date range:

    const whereConditions = {
      date: {
        [Op.between]: [startDate, endDate],
      },
      [Op.and]: [
        {
          // This checks whether the start_time falls between startTime and endTime, or the end_time falls between startTime and endTime,
          // or if the start_time is less than or equal to startTime and the end_time is greater than or equal to endTime.
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

    // format: 2023-06-21T00:00:00.000Z
    const isSameDay = startDate.toISOString().split('T')[0] === endDate.toISOString().split('T')[0]

    // If it's the same day, add additional time conditions
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

    // Made with chatgpt, Marcus
    // The bookingsByClassroom object is a list where the key is the room_id and the value is an array of bookings for that room.
    // organize a list of bookings in an object, where the key is the roomId, and the value is a list of bookings in that classroom
    // For every booking in the allBookings list, the reduce function "udføres"
    // RoomId is extracted from every booking
    const bookingsByClassroom = allBookings.reduce((acc, booking) => {
      // accumulator = empty object
      const roomId = booking.room_id
      // if roomId not already exists in the acc, an empty list is made
      if (!acc[roomId]) {
        acc[roomId] = []
      }
      // Add the booking to the roomId´s list
      acc[roomId].push({
        start_time: booking.start_time,
        end_time: booking.end_time,
        date: booking.date,
      })
      // after every iteration, the updated acc, returns to the next iteration
      return acc
    }, {})

    // Made with chatgpt, Marcus
    const calculateFreeTimes = (bookings, startHour, endHour) => {
      const intervals = []

      // Group bookings by date
      // The reduce method iterates over the bookings array and accumulates the results in acc (the accumulator).
      // This ensures that all bookings are grouped by their date in the acc object,
      // where each date (dateStr) has an associated list of booking objects.
      const bookingsByDate = bookings.reduce((acc, booking) => {
        const dateStr = booking.date.toISOString().split('T')[0]
        // if dateStr is not a key in the acc, it adds the dateStr as a key in acc, with an empty list as value
        if (!acc[dateStr]) acc[dateStr] = []
        // Adds the current booking to the list of bookings under the key dateStr in acc.
        acc[dateStr].push(booking)
        return acc
      }, {})

      const current = new Date(startDate)
      const end = new Date(endDate)

      // Loop through each date from startDate to endDate
      while (current <= end) {
        const dateStr = current.toISOString().split('T')[0] // Get the date part of format 2023-06-21T00:00:00.000Z
        const dayBookings = bookingsByDate[dateStr] || [] // Get bookings for the current date or an empty array if none

        // localCompare: -1 if a.start_time is before b.start_time, 0 if same value, 1 if a efter b
        dayBookings.sort((a, b) => a.start_time.localeCompare(b.start_time))

        let currentStart = startHour // Initialize the start time for free intervals
        const dayIntervals = [] // Initialize an array to store free intervals for the current date

        //  Loop through the bookings for the current date
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
        current.setDate(current.getDate() + 1) // Move to the next date
      }

      return intervals // Return the array of free intervals
    }

    // Calculate free times for each classroom
    const classroomsWithAvailability = allClassrooms.map(classroom => {
      const roomId = classroom.room_id
      const bookings = bookingsByClassroom[roomId] || [] // Get bookings for the room or an empty array if none
      let freeTimes

      if (bookings.length === 0) {
        // If there are no bookings, initialize free times for the entire date range
        freeTimes = []
        const current = new Date(startDate)
        const end = new Date(endDate)

        while (current <= end) {
          // Check if the current date is during any holidays
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
        // If there are bookings, calculate free times using the calculateFreeTimes function
        freeTimes = calculateFreeTimes(bookings, startTime, endTime)
      }
      // Return an object representing the classroom with its free times
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
