import { DataTypes } from 'sequelize'
import sequelize from '../database.js'
import Teacher from './teacher.js'

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

try {
  await sequelize.sync({ alter: true })
  console.log('The table for the Course model was just (re)created!')
} catch (error) {
  console.error('Unable to create or recreate the table:', error)
}

export default Course
