import { DataTypes } from 'sequelize'
import sequelize from '../database.js'

const School = sequelize.define(
  'School',
  {
    school_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(55),
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: 'schools',
  },
)

try {
  await sequelize.sync()
  console.log('School table was just (re)created successfully!')
} catch (error) {
  console.error('Error updating the school table:', err)
  throw err
}

export default School
