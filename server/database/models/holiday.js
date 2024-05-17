import { DataTypes } from 'sequelize'
import sequelize from '../database.js'
import School from './school.js'

const Holiday = sequelize.define(
  'Holiday',
  {
    holiday_id: {
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
    name: {
      type: DataTypes.STRING(55),
      allowNull: false,
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
  },
  {
    timestamps: false,
    tableName: 'holidays',
  },
)


export default Holiday
