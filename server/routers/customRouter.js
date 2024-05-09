import {Router} from 'express';
import teacher from '../database/models/teacher.js'
import location from '../database/models/location.js'
import classroom from '../database/models/classroom.js'
import course from '../database/models/course.js'
import booking from '../database/models/booking.js'
import { Op } from 'sequelize';

const router = Router();

router.get("/booking-form-info", async (req, res) => {
  try {
    let school_id = req.session.user.school_id;

    let locations = await location.findAll({
      where: { school_id: school_id },
    });

    let classrooms = await classroom.findAll({
      where: { school_id: school_id },
    });

    let teachers = await teacher.findAll({
        where: { school_id: school_id },
      });
      
    let teacherIds = teachers.map(teacher => teacher.id);
    
    let courses = await course.findAll({
    where: {
        teacher_id: {
        [Op.in]: teacherIds
        }
    }
    });




  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "Failed to get form info" });
  }
});


export default router;