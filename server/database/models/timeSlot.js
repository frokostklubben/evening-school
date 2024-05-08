import { DataTypes } from 'sequelize'
import sequelize from '../database.js'

const TimeSlot = sequelize.define(
  'Time_slot',
  {
    time_slot_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: 'time_slots',
  },
)

export default TimeSlot
