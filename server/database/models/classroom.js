import { DataTypes } from 'sequelize'
import sequelize from '../database.js'
import Classroom_purpose from './classroomPurpose.js'
import Inventory from './inventory.js'

const Classroom = sequelize.define(
  'Classroom',
  {
    room_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    room_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: 'classrooms',
  },
)

Classroom_purpose.hasMany(Classroom, { foreignKey: 'purpose_id' })
Classroom.belongsTo(Classroom_purpose, { foreignKey: 'purpose_id' })

Classroom.belongsToMany(Inventory, {
  through: 'ClassroomInventory',
  foreignKey: 'room_id',
  timestamps: false,
})

Inventory.belongsToMany(Classroom, {
  through: 'ClassroomInventory',
  foreignKey: 'inventory_id',
  timestamps: false,
})

export default Classroom
