import { Router, response } from 'express';
import teacher from '../database/models/teacher.js'
import location from '../database/models/location.js'
import classroom from '../database/models/classroom.js'
import course from '../database/models/course.js'
import booking from '../database/models/booking.js'
import Holiday from '../database/models/holiday.js';
import { Op } from 'sequelize';
import Booking from '../database/models/booking.js';

const router = Router();

router.get("/api/booking-form-info", async (req, res) => {
  try {
    let school_id = req.session.user.schoolId;

    let locations = await location.findAll({
      where: { school_id: school_id },
    });

    let locationIds = locations.map(location => location.location_id)

    let classrooms = await classroom.findAll({
      where: {
        location_id: {
          [Op.in]: locationIds
        }
      },
    });

    let teachers = await teacher.findAll({
      where: { school_id: school_id },
    });

    let teacherIds = teachers.map(teacher => teacher.teacher_id);

    let courses = await course.findAll({
      where: {
        teacher_id: {
          [Op.in]: teacherIds
        }
      }
    });

    res.status(200).send({
      data: {
        locations,
        classrooms,
        courses,
        teachers,
      }
    })

  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "Failed to get form info" });
  }

});


router.post("/api/check-booking-dates", async (req, res) => {
  try {
    let bookingdates = req.body;
    let school_id = req.session.user.schoolId;

    // loop thought each booking date and check for conflicts
    for (let i = 0; i < bookingdates.length; i++) {

      //see if any holidays conflict with the booking date
      let holidayConflict = await Holiday.findOne({
        where: {
          [Op.and]: [
            { school_id: school_id },
            { start_date: { [Op.lte]: bookingdates[i].date } },
            { end_date: { [Op.gte]: bookingdates[i].date } }
          ]
        }
      });

      //no need to run the booking time conflict check if there is a holiday conflict
      if (holidayConflict !== null) {
        bookingdates[i].holidayConflict = holidayConflict;
        bookingdates[i].conflict = true;
        continue;
      }

      //see if any bookings conflict with the booking date
      let bookingConflicts = await booking.findAll({
        where: {
          [Op.and]: [
            { date: bookingdates[i].date },
            { room_id: bookingdates[i].room_id },
            {
              [Op.or]: [
                { start_time: { [Op.between]: [bookingdates[i].startTime, bookingdates[i].endTime] } },
                { end_time: { [Op.between]: [bookingdates[i].startTime, bookingdates[i].endTime] } }
              ]
            }
          ]
        }
      });

      //add a conflict bookings to the booking date object, if there is any conflicts
      if (bookingConflicts.length > 0) {
        bookingdates[i].conflict = true;
        bookingdates[i].bookingConflicts = bookingConflicts;
      } else {
        bookingdates[i].conflict = false;
      }
    }

    //sort the booking dates by date
    bookingdates.sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });

    res.status(200).send({ data: bookingdates });

  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "Failed to check booking dates" });
  }
});


export default router;