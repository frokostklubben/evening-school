import { DataTypes } from 'sequelize'
import sequelize from '../database.js'
import School from './school.js'

const User = sequelize.define(
  'User',
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    school_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: School,
        key: 'school_id',
      },
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
    tableName: 'users',
  },
)

try {
  await sequelize.sync()
  console.log('User table was just (re)created successfully!')
} catch (error) {
  console.error('Error updating the user table:', err)
  throw err
}

export default User
