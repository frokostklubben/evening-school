import sequelize from '../database.js'
import Course from './course.js'
import Classroom from './classroom.js'

const Classroom_course = sequelize.define(
  'Classroom_course',
  {},
  {
    timestamps: false,
  },
)
Classroom.belongsToMany(Course, {
  through: 'Classroom_course',
  foreignKey: 'room_id',
})
Course.belongsToMany(Classroom, {
  through: 'Classroom_course',
  foreignKey: 'course_id',
})

export default Classroom_course
