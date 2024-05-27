import School from './school.js'
import Role from './Role.js'
import User from './user.js'
import Location from './location.js'
import Classroom from './classroom.js'
import Classroom_purpose from './classroomPurpose.js'
import Teacher from './teacher.js'
import Course from './course.js'
import Inventory from './inventory.js'
import Booking from './booking.js'
import Classroom_inventory from './classroomInventory.js'

function applyAssociations() {
  // School + Location
  School.hasMany(Location, { foreignKey: 'school_id' })
  Location.belongsTo(School, { foreignKey: 'school_id' })

  // School has many Teachers
  School.hasMany(Teacher, { foreignKey: 'school_id' })
  Teacher.belongsTo(School, { foreignKey: 'school_id' })

  // Role has many Users?? (Not sure if this is correct) --> Users can have many roles?
  Role.hasMany(User, { foreignKey: 'role_id' })
  User.belongsTo(Role, { foreignKey: 'role_id' })

  // School has many Users
  School.hasMany(User, { foreignKey: 'school_id' })
  User.belongsTo(School, { foreignKey: 'school_id' })

  // Location has many Classrooms
  Location.hasMany(Classroom, { foreignKey: 'location_id' })
  Classroom.belongsTo(Location, { foreignKey: 'location_id' })

  // Classroom has many Classroom_purpose
  Classroom.belongsTo(Classroom_purpose, { foreignKey: 'purpose_id', as: 'Purpose' })
  Classroom_purpose.hasMany(Classroom, { foreignKey: 'purpose_id' })

  // Classroom belongs to Inventory through Classroom_inventory
  Classroom.belongsToMany(Inventory, {
    through: Classroom_inventory,
    foreignKey: 'room_id',
    otherKey: 'inventory_id',
  })
  Inventory.belongsToMany(Classroom, {
    through: Classroom_inventory,
    foreignKey: 'inventory_id',
    otherKey: 'room_id',
  })

  // Teacher has many Courses
  Teacher.hasMany(Course, { foreignKey: 'teacher_id' })
  Course.belongsTo(Teacher, { foreignKey: 'teacher_id' })

  // Classroom has many Bookings
  Classroom.hasMany(Booking, { foreignKey: 'room_id' })
  Booking.belongsTo(Classroom, { foreignKey: 'room_id' })

  // Course has many Bookings
  Course.hasMany(Booking, { foreignKey: 'course_id' })
  Booking.belongsTo(Course, { foreignKey: 'course_id' })
}

export { applyAssociations }
