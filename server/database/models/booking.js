import sequelize from '../database.js'
import Course from './course.js'
import Classroom from './classroom.js'
import TimeSlot from './timeSlot.js'
import { DataTypes } from 'sequelize'

const Booking = sequelize.define(
  'Booking',
  {
    booking_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Course,
        key: 'course_id',
      },
    },
    room_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Classroom,
        key: 'room_id',
      },
    },
    time_slot_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: TimeSlot,
        key: 'time_slot_id',
      },
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    }
  },
  {
    timestamps: false,
  },
)

export default Booking
