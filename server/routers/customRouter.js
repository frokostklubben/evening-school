import { Router, response } from 'express';
import teacher from '../database/models/teacher.js'
import location from '../database/models/location.js'
import classroom from '../database/models/classroom.js'
import course from '../database/models/course.js'
import booking from '../database/models/booking.js'
import { Op } from 'sequelize';

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


export default router;