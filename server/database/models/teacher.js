import { DataTypes } from 'sequelize'
import sequelize from '../database.js'

const Teacher = sequelize.define(
  'Teacher',
  {
    teacher_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    first_name: {
      type: DataTypes.STRING(55),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(55),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(55),
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: 'teachers',
  },
)

try {
  await sequelize.sync()
  console.log('Teacher table was just (re)created successfully!')
} catch (error) {
  console.error('Error updating the teacher table:', err)
  throw err
}

export default Teacher
