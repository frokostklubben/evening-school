import { DataTypes } from 'sequelize'
import sequelize from './database.js'

import School from './models/school.js'
import Role from './models/Role.js'
import User from './models/user.js'
import Location from './models/location.js'
import Classroom from './models/classroom.js'
import Teacher from './models/teacher.js'
import Course from './models/course.js'
import Classroom_course from './models/classroomCourse.js'
import Inventory from './models/inventory.js'
import Classroom_inventory from './models/classroomInventory.js'

School.bulkCreate([
    { name: "FOF"},
    { name: "AOF"},
    { name: "Aftenskolerne Varde Kommune"}])

Role.bulkCreate([
    { role: "admin" },
    { role: "office_employee" }
])

User.bulkCreate([
    { school_id: null, first_name: "admin", last_name: "admin", email: "admin@admin.dk", role: "admin" },
    { school_id: 1, first_name: "Konthor", last_name: "Konthorsen", email: "admin@admin.dk", role: "admin" }
])


