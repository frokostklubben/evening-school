import { DataTypes } from 'sequelize'
import sequelize from '../database.js'
import { Op } from 'sequelize'
import Location from './location.js'
import Classroom_purpose from './classroomPurpose.js'
import Inventory from './inventory.js'
import Booking from './booking.js'

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
    // location_id: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: Location,
    //     key: 'location_id',
    //   },
    // },

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

// In your Booking model, you have defined a foreign key relationship with Classroom
// However, in your Classroom model, you haven't defined a corresponding relationship back to Booking.

Classroom.hasMany(Booking, { foreignKey: 'room_id' })
Booking.belongsTo(Classroom, { foreignKey: 'room_id' })

export default Classroom
