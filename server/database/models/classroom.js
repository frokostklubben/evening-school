import { DataTypes } from 'sequelize'
import sequelize from '../database.js'
import Location from './location.js'
import Classroom_purpose from './classroomPurpose.js'

const Classroom = sequelize.define(
  'Classroom',
  {
    room_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    location_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Location,
        key: 'location_id',
      },
    },
    purpose_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Classroom_purpose,
        key: 'purpose_id'
      }
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

export default Classroom
