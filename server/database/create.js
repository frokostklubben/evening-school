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
import Classroom_purpose from './models/classroomPurpose.js'
import Classroom from './models/classroom.js'
import Location from './models/location.js'

import Teacher from './models/teacher.js'
import Course from './models/course.js'
import Inventory from './models/inventory.js'
import Holiday from './models/holiday.js'

// DO NOT DELETE THE FOLLOWING IMPORTS - EVEN THOUGH THEY ARE NOT ACTIVELY USED
import Booking from './models/booking.js'
// import Classroom_inventory from './models/classroomInventory.js'

await connection.sync({ force: true })

await School.bulkCreate([{ name: 'FOF' }, { name: 'AOF' }, { name: 'Folkeuniversitetet' }, { name: 'LOF' }, { name: 'VUC' }, { name: 'DOF' }])

await Role.bulkCreate([{ role: 'admin' }, { role: 'office_employee' }])

// role_id 1 = admin, 2 = office_employee
await User.bulkCreate([
  { school_id: 2, first_name: 'admin', last_name: 'jensen', email: 'admin@jensen.dk', role_id: 1, hashed_password: '$2b$14$ZEBeCFkCJagEIrKR78kahekLnPSkAYHwiCeIZtk92FGmtPc3DwI5a' },
  { school_id: 1, first_name: 'Kurt', last_name: 'Konthorsen', email: 'kurt@konthorsen.dk', role_id: 2, hashed_password: '$2b$14$ZEBeCFkCJagEIrKR78kahekLnPSkAYHwiCeIZtk92FGmtPc3DwI5a' },
  { school_id: 1, first_name: 'Lars', last_name: 'Mortensen', email: 'lars@mortensen.dk', role_id: 2, hashed_password: '$2b$14$ZEBeCFkCJagEIrKR78kahekLnPSkAYHwiCeIZtk92FGmtPc3DwI5a' },
])

await Location.bulkCreate([
  { school_id: 1, school_name: 'FOF Syd- og Vestsjælland', zip_code: 4200, city: 'Slagelse', street_name: 'Gl.Torv', street_number: 4 },
  { school_id: 1, school_name: 'FOF København', zip_code: 1799, city: 'København', street_name: 'Gentoftegade', street_number: 52 },
  { school_id: 1, school_name: 'FOF Nordsjælland', zip_code: 2920, city: 'Charlottenlund ', street_name: 'Ordrupvej ', street_number: 60 },
  { school_id: 1, school_name: 'FOF Sydjylland', zip_code: 6000, city: 'Kolding', street_name: 'Ågade', street_number: 27 },
  { school_id: 1, school_name: 'FOF Aarhus', zip_code: 8000, city: 'Aarhus C', street_name: 'Søren Frichs Vej', street_number: 36 },

  { school_id: 2, school_name: 'AOF Aalborg', zip_code: 9000, city: 'Aalborg', street_name: 'Første divisionsvej', street_number: 5 },
  { school_id: 2, school_name: 'AOF Stenløse', zip_code: 3660, city: 'Stenløse', street_name: 'Byvej', street_number: 2 },
  { school_id: 2, school_name: 'AOF Gentofte', zip_code: 2820, city: 'Gentofte', street_name: 'Nybrovej', street_number: 2 },
  { school_id: 3, school_name: 'Folkeuniversitetet Odense', zip_code: 5000, city: 'Odense', street_name: 'Kochsgade', street_number: 31 },
  { school_id: 3, school_name: 'Folkeuniversitetet Esbjerg', zip_code: 6700, city: 'Esbjerg', street_name: 'Strandbygade', street_number: 5 },
  { school_id: 4, school_name: 'LOF Midtjylland', zip_code: 7400, city: 'Herning', street_name: 'Birk Centerpark', street_number: 40 },
  { school_id: 4, school_name: 'LOF Sydsjælland', zip_code: 4700, city: 'Næstved', street_name: 'Ringstedgade', street_number: 23 },
  { school_id: 5, school_name: 'VUC Lyngby', zip_code: 2800, city: 'Kongens Lyngby', street_name: 'Lundtoftegårdsvej', street_number: 95 },
  { school_id: 5, school_name: 'VUC Frederiksberg', zip_code: 2000, city: 'Frederiksberg', street_name: 'Falkoner Alle', street_number: 20 },
  { school_id: 6, school_name: 'DOF Vejle', zip_code: 7100, city: 'Vejle', street_name: 'Vestre Engvej', street_number: 51 },
  { school_id: 6, school_name: 'DOF Skive', zip_code: 7800, city: 'Skive', street_name: 'Resenvej', street_number: 25 },
])

await Classroom_purpose.bulkCreate([
  { purpose: 'Musik' },
  { purpose: 'Sløjd' },
  { purpose: 'Håndarbejde' },
  { purpose: 'Foredrag' },
  { purpose: 'PC-lab' },
  { purpose: 'Videoredigering' },
  { purpose: 'Fotostudie' },
  { purpose: 'Webudvikling' },
  { purpose: 'Grafisk Design' },
  { purpose: 'Digital Markedsføring' },
  { purpose: 'Robotteknik' },
  { purpose: 'Biologi Laboratorium' },
  { purpose: 'Matematik Workshop' },
  { purpose: 'Sprog Laboratorium' },
])

const classrooms = await Classroom.bulkCreate([
  { room_name: 'A101', location_id: 1, purpose_id: 6, capacity: 20 }, // PC-lab for programmering i location 1
  { room_name: 'A102', location_id: 1, purpose_id: 7, capacity: 15 }, // Videoredigeringsstudie i location 1
  { room_name: 'A103', location_id: 1, purpose_id: 8, capacity: 10 }, // Fotostudie i location 1
  { room_name: 'B104', location_id: 2, purpose_id: 1, capacity: 25 }, // Musikproduktionslokale i location 2
  { room_name: 'B105', location_id: 2, purpose_id: 2, capacity: 30 }, // Softwareudviklingsrum i location 2
  { room_name: 'A106', location_id: 3, purpose_id: 4, capacity: 10 }, // Kunst og designværksted i location 3
  { room_name: 'A107', location_id: 3, purpose_id: 5, capacity: 40 }, // Lokale for digitale præsentationer i location 3
  { room_name: 'A108', location_id: 3, purpose_id: null, capacity: 15 }, // Maker-space for fabrikation i location 3
  { room_name: 'B109', location_id: 4, purpose_id: 6, capacity: 18 }, // Makerspace for robotteknologi i location 4
  { room_name: 'B110', location_id: 4, purpose_id: 7, capacity: 12 }, // Mediestudie for indholdsproduktion i location 4
  { room_name: 'B111', location_id: 4, purpose_id: 8, capacity: 8 }, // Drone og fototeknikstudie i location 4
  { room_name: 'A112', location_id: 5, purpose_id: 1, capacity: 20 }, // Lokale for lydteknik i location 5
  { room_name: 'A113', location_id: 5, purpose_id: 2, capacity: 25 }, // Lokale for datavidenskab og AI i location 5
])

await Teacher.bulkCreate([
  { school_id: 1, first_name: 'Birgit', last_name: 'Vejen', email: 'bv@fof.dk', is_active: 1 },
  { school_id: 1, first_name: 'Michael', last_name: 'Jørgensen', email: 'mj@fof.dk', is_active: 1 },
  { school_id: 2, first_name: 'Amdi', last_name: 'Holm', email: 'ah@aof.dk', is_active: 1 },
  { school_id: 3, first_name: 'Claus', last_name: 'Larsen', email: 'oksefarsen@aof.dk', is_active: 0 },
  { school_id: 2, first_name: 'Eva', last_name: 'Poulsen', email: 'eva@aof.dk', is_active: 1 },
  { school_id: 1, first_name: 'Niels', last_name: 'Hansen', email: 'niels@fof.dk', is_active: 1 },
  { school_id: 3, first_name: 'Mette', last_name: 'Jensen', email: 'mette@folkeuniversitetet.dk', is_active: 1 },
  { school_id: 4, first_name: 'Pia', last_name: 'Nielsen', email: 'pia@lof.dk', is_active: 1 },
  { school_id: 5, first_name: 'Søren', last_name: 'Christensen', email: 'soeren@vuc.dk', is_active: 1 },
  { school_id: 6, first_name: 'Karen', last_name: 'Larsen', email: 'karen@dof.dk', is_active: 1 },
])

await Course.bulkCreate([
  { teacher_id: 1, course_name: 'Grundlæggende Python', description: 'Lær Python-programmering fra bunden og byg dine egne dataapplikationer.' },
  { teacher_id: 1, course_name: 'Grundlæggende Javascript', description: 'Lær javascript-programmering fra bunden og byg dine egne dataapplikationer.' },
  { teacher_id: 1, course_name: 'Grundlæggende Java', description: 'Lær Java-programmering fra bunden og byg dine egne dataapplikationer.' },
  { teacher_id: 2, course_name: 'Videoredigering med Premiere Pro', description: 'Lær avancerede redigeringsteknikker og visuelle effekter i Adobe Premiere Pro.' },
  { teacher_id: 3, course_name: 'Digital Fotografi', description: 'Dyk ned i professionel fotografering og lær at bruge DSLR-kameraer.' },
  { teacher_id: 4, course_name: 'Musikproduktion i Ableton Live', description: 'Lær at skabe musik og mixe spor med Ableton Live.' },
  { teacher_id: 5, course_name: 'Introduktion til Machine Learning', description: 'Grundlæggende principper i machine learning og anvendelse af AI-teknologier.' },
  { teacher_id: 6, course_name: 'Moderne Kunst og Mixed Media', description: 'Udforsk moderne kunstteknikker og skab dine egne værker med forskellige medier.' },
  { teacher_id: 7, course_name: 'Masterclass i PowerPoint og Keynote', description: 'Bliv ekspert i at designe overbevisende præsentationer for erhvervslivet.' },
  { teacher_id: 8, course_name: 'DIY og Hjemmefabrikation', description: 'Lær at bruge 3D-printere, laser cuttere og andet udstyr til at skabe egne projekter.' },
  { teacher_id: 1, course_name: 'Robotteknologi for Begyndere', description: 'Introduktion til robotteknologi og automatisering.' },
  { teacher_id: 2, course_name: 'Indholdsproduktion og Branding', description: 'Lær at skabe engagerende indhold og administrere digitale brands.' },
  { teacher_id: 3, course_name: 'Avanceret Dronefotografering', description: 'Teknikker og reguleringer for professionel dronefotografering.' },
  { teacher_id: 4, course_name: 'Lydteknik og Akustik', description: 'Principper i lydteknik og opsætning af lydstudier.' },
  { teacher_id: 5, course_name: 'Data Science og Big Data Analyse', description: 'Teknikker til håndtering og analyse af store datamængder.' },
])

await Booking.bulkCreate([
  { course_id: 1, room_id: 1, start_time: '16:30:00', end_time: '19:30:00', date: '2024-05-22' },
  { course_id: 2, room_id: 1, start_time: '12:00:00', end_time: '14:00:00', date: '2024-05-24' },
  { course_id: 3, room_id: 2, start_time: '10:00:00', end_time: '12:00:00', date: '2024-05-25' },
  { course_id: 4, room_id: 2, start_time: '14:00:00', end_time: '16:00:00', date: '2024-05-26' },
  { course_id: 5, room_id: 3, start_time: '09:00:00', end_time: '11:00:00', date: '2024-05-27' },
  { course_id: 6, room_id: 3, start_time: '13:00:00', end_time: '15:00:00', date: '2024-05-28' },
  { course_id: 7, room_id: 3, start_time: '11:00:00', end_time: '13:00:00', date: '2024-05-29' },
  { course_id: 8, room_id: 4, start_time: '15:00:00', end_time: '17:00:00', date: '2024-05-30' },
  { course_id: 9, room_id: 5, start_time: '10:00:00', end_time: '12:00:00', date: '2024-05-31' },
  { course_id: 10, room_id: 5, start_time: '09:00:00', end_time: '11:00:00', date: '2024-06-01' },
  { course_id: 1, room_id: 5, start_time: '12:00:00', end_time: '14:00:00', date: '2024-06-02' },
  { course_id: 2, room_id: 6, start_time: '14:00:00', end_time: '16:00:00', date: '2024-06-03' },
  { course_id: 3, room_id: 6, start_time: '16:00:00', end_time: '18:00:00', date: '2024-06-04' },
  { course_id: 4, room_id: 6, start_time: '11:00:00', end_time: '13:00:00', date: '2024-06-05' },
])

const inventory = await Inventory.bulkCreate([
  { item_name: 'Borde' },
  { item_name: 'Stole' },
  { item_name: 'Computere' },
  { item_name: 'Projektorer' },
  { item_name: 'Videokameraer' },
  { item_name: 'Fotoudstyr' },
  { item_name: 'Musikinstrumenter' },
  { item_name: 'Mikrofoner' },
  { item_name: '3D-printere' },
  { item_name: 'Robotik Kits' },
  { item_name: 'Malergrej' },
  { item_name: 'Droneudstyr' },
  { item_name: 'Skriveartikler' },
  { item_name: 'Lydisoleringspaneler' },
])

// Assigning inventory to classrooms based on their specific purposes and needs
await inventory[0].addClassroom(classrooms[0]) // Borde til PC-lab
await inventory[1].addClassroom(classrooms[0]) // Stole til PC-lab
await inventory[2].addClassroom(classrooms[0]) // Computere til PC-lab
await inventory[3].addClassroom(classrooms[1]) // Projektorer til Videoredigeringsstudie
await inventory[4].addClassroom(classrooms[1]) // Videokameraer til Videoredigeringsstudie
await inventory[5].addClassroom(classrooms[2]) // Fotoudstyr til Fotostudie
await inventory[6].addClassroom(classrooms[3]) // Musikinstrumenter til Musikproduktionslokale
await inventory[7].addClassroom(classrooms[3]) // Mikrofoner til Musikproduktionslokale
await inventory[8].addClassroom(classrooms[7]) // 3D-printere til Maker-space
await inventory[9].addClassroom(classrooms[8]) // Robotik Kits til Makerspace for robotteknologi
await inventory[10].addClassroom(classrooms[5]) // Malergrej til Kunst og designværksted
await inventory[11].addClassroom(classrooms[11]) // Droneudstyr til Drone og fototeknikstudie
await inventory[12].addClassroom(classrooms[4]) // Skriveartikler til Softwareudviklingsrum
await inventory[13].addClassroom(classrooms[4]) // Lydisoleringspaneler til Softwareudviklingsrum

await Holiday.bulkCreate([
  { name: 'Juleaften', school_id: '1', start_date: '2024-12-24', end_date: '2024-12-24' },
  { name: 'Sommerferie', school_id: '2', start_date: '2024-06-01', end_date: '2024-08-01' },
])
