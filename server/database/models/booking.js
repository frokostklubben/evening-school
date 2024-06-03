import sequelize from '../database.js'
import Course from './course.js'
import Classroom from './classroom.js'
import { DataTypes } from 'sequelize'

const Booking = sequelize.define(
  'Booking',
  {
    booking_id: {
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
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  },
)

Booking.belongsTo(Classroom, { foreignKey: 'room_id' })
Booking.belongsTo(Course, { foreignKey: 'course_id' })

export default Booking
