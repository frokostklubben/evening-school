import { DataTypes } from 'sequelize'
import sequelize from '../database.js'
import Teacher from './teacher.js'
import Location from './location.js'

const Course = sequelize.define(
  'Course',
  {
    course_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    teacher_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Teacher,
        key: 'teacher_id',
      },
    },
    location_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Location,
        key: 'location_id',
      },
    },
    course_name: {
      type: DataTypes.STRING(55),
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: 'courses',
  },
)

export default Course
