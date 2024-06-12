import sequelize from '../database.js'
import { DataTypes } from 'sequelize'
import Classroom from './classroom.js'
import Course from './course.js'

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

Classroom.hasMany(Booking, { foreignKey: 'room_id' })
Booking.belongsTo(Classroom, { foreignKey: 'room_id' })

Course.hasMany(Booking, { foreignKey: 'course_id', onDelete: 'CASCADE'})
Booking.belongsTo(Course, { foreignKey: 'course_id' })

export default Booking
