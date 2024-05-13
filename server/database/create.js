import 'dotenv/config'
import { Sequelize } from 'sequelize'

let sequelize = new Sequelize(null, process.env.DB_USER, process.env.DB_PASS, {
  host: 'localhost',
  dialect: 'mysql',
})

try {
  await sequelize.authenticate()
  console.log('Connection has been established successfully.')
  await sequelize.query(`DROP DATABASE IF EXISTS ${process.env.DB_NAME}`)
  await sequelize.query(`CREATE DATABASE ${process.env.DB_NAME}`)
  console.log('DATABASE DROPPED AND CREATED')
  sequelize.close()
} catch (error) {
  console.error('Unable to connect to the database:', error)
}

import connection from './database.js'
import School from './models/school.js'
import Role from './models/Role.js'
import User from './models/user.js'
import Location from './models/location.js'
import Classroom_purpose from './models/classroomPurpose.js'
import Classroom from './models/classroom.js'
import Teacher from './models/teacher.js'
import Course from './models/course.js'
import Inventory from './models/inventory.js'

// DO NOT DELETE THE FOLLOWING IMPORTS - EVEN THOUGH THEY ARE NOT ACTIVELY USED
import Booking from './models/booking.js'
import TimeSlot from './models/timeSlot.js'
import Classroom_inventory from './models/classroomInventory.js'

await connection.sync({ force: true })

await School.bulkCreate([{ name: 'FOF' }, { name: 'AOF' }, { name: 'Aftenskolerne Varde Kommune' }])

await Role.bulkCreate([{ role: 'admin' }, { role: 'office_employee' }])

// role_id 1 = admin, 2 = office_employee
await User.bulkCreate([
  { school_id: 1, first_name: 'admin', last_name: 'jensen', email: 'admin@jensen.dk', role_id: 1, hashed_password: '$2b$14$ZEBeCFkCJagEIrKR78kahekLnPSkAYHwiCeIZtk92FGmtPc3DwI5a' },
  { school_id: 1, first_name: 'Kurt', last_name: 'Konthorsen', email: 'kurt@konthorsen.dk', role_id: 2, hashed_password: '$2b$14$ZEBeCFkCJagEIrKR78kahekLnPSkAYHwiCeIZtk92FGmtPc3DwI5a' },
  { school_id: 2, first_name: 'Lars', last_name: 'Mortensen', email: 'lars@mortensen.dk', role_id: 2, hashed_password: '$2b$14$ZEBeCFkCJagEIrKR78kahekLnPSkAYHwiCeIZtk92FGmtPc3DwI5a' },
])

await Location.bulkCreate([
  { school_id: 1, school_name: 'FOF Ansager', zip_code: 6823, city: 'Ansager', street_name: 'Havevej', street_number: 1 },
  { school_id: 1, school_name: 'FOF Kolding', zip_code: 6000, city: 'Kolding', street_name: 'Irisvej', street_number: 8 },
  { school_id: 1, school_name: 'FOF Aarhus', zip_code: 8000, city: 'Aarhus C', street_name: 'Fuglesangs Allé', street_number: 28 },
  { school_id: 2, school_name: 'AOF Aalborg', zip_code: 9000, city: 'Aalborg', street_name: 'Første divisionsvej', street_number: 5 },
  { school_id: 2, school_name: 'AOF Stenløse', zip_code: 3660, city: 'Stenløse', street_name: 'Byvej', street_number: 2 },
  { school_id: 2, school_name: 'AOF Gentofte', zip_code: 2820, city: 'Gentofte', street_name: 'Nybrovej', street_number: 2 },
])

await Classroom_purpose.bulkCreate([{ purpose: 'Musik' }, { purpose: 'EDB' }, { purpose: 'Sløjd' }, { purpose: 'Håndarbejde' }, { purpose: 'Foredrag' }])

const classrooms = await Classroom.bulkCreate([
  { location_id: 1, purpose_id: 1, capacity: 32 },
  { location_id: 1, purpose_id: null, capacity: 15 },
  { location_id: 2, purpose_id: 2, capacity: 28 },
  { location_id: 3, purpose_id: 3, capacity: 16 },
  { location_id: 4, purpose_id: 4, capacity: 16 },
  { location_id: 4, purpose_id: 5, capacity: 16 },
])

await Teacher.bulkCreate([
  { first_name: 'Birgit', last_name: 'Vejen', email: 'bv@fof.dk' },
  { first_name: 'Michael', last_name: 'Jørgensen', email: 'mj@fof.dk' },
  { first_name: 'Amdi', last_name: 'Holm', email: 'ah@aof.dk' },
  { first_name: 'Claus', last_name: 'Larsen', email: 'oksefarsen@aof.dk' },
])

await Course.bulkCreate([
  { teacher_id: 1, course_name: 'Italiensk opera 1' },
  { teacher_id: 1, course_name: 'Italiensk opera 2' },
  { teacher_id: 2, course_name: 'Git 101' },
  { teacher_id: 2, course_name: 'Sveltestrap for øvede' },
  { teacher_id: 3, course_name: 'Byg en båd' },
  { teacher_id: 3, course_name: "Kritisk læsning af 'Ib i en kø'" },
  { teacher_id: 4, course_name: 'Kor for tonedøve' },
])

var endTime1 = new Date();
endTime1.setHours(21);
endTime1.setMinutes(5);
endTime1.setSeconds(15);


var endTime2 = new Date();
endTime2.setHours(23);
endTime2.setMinutes(5);
endTime2.setSeconds(25);


await TimeSlot.bulkCreate([
  { start_time: '14:30:00', end_time: '16:30:00' },
  { start_time: '12:00:00', end_time: '14:00:00' }
])

await Booking.bulkCreate([
  { course_id: 1, room_id: 1, time_slot_id: 1, date: new Date() },
  { course_id: 2, room_id: 2, time_slot_id: 2, date: new Date() }
])


// Inventory
const inventory = await Inventory.bulkCreate([{ item_name: 'Borde' }, { item_name: 'Instrumenter' }, { item_name: 'Computere' }, { item_name: 'Spanskrør' }])


await inventory[0].addClassroom(classrooms[0])
await inventory[1].addClassroom(classrooms[0])
await inventory[2].addClassroom(classrooms[0])
await inventory[2].addClassroom(classrooms[1])
await inventory[3].addClassroom(classrooms[1])
await inventory[0].addClassroom(classrooms[2])
await inventory[3].addClassroom(classrooms[2])
await inventory[2].addClassroom(classrooms[2])
await inventory[1].addClassroom(classrooms[3])
await inventory[3].addClassroom(classrooms[3])
