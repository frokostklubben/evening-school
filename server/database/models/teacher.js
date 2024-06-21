import { DataTypes } from 'sequelize'
import sequelize from '../database.js'
import School from './school.js'

const Teacher = sequelize.define(
  'Teacher',
  {
    teacher_id: {
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
      unique: true,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: 'teachers',
  },
)

export default Teacher
