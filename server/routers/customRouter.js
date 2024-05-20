import { Router, response } from 'express';
import teacher from '../database/models/teacher.js'
import location from '../database/models/location.js'
import classroom from '../database/models/classroom.js'
import course from '../database/models/course.js'
import booking from '../database/models/booking.js'
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

    //der skal ligges et kvarter til sluttiden

    // check if booking dates are available, it has startTime and endTime and date
    for (let i = 0; i < bookingdates.length; i++) {
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

      if (bookingConflicts.length > 0) {
        bookingdates[i].conflict = true;

        // add bookingConflicts found to the bookingdates array
        bookingdates[i].bookingConflicts = bookingConflicts;


      } else {
        bookingdates[i].conflict = false;
      }
    }

    /*
    bookingdates.sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });
    */

    res.status(200).send({ data: bookingdates });

  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "Failed to check booking dates" });
  }
});



export default router;