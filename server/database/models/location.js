import { DataTypes } from 'sequelize'
import sequelize from '../database.js'
import School from './school.js'
import Classroom from './classroom.js'

const Location = sequelize.define(
  'Location',
  {
    location_id: {
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
    school_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    zip_code: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    street_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    street_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: 'locations',
  },
)

Location.hasMany(Classroom, { foreignKey: 'location_id' })
Classroom.belongsTo(Location, { foreignKey: 'location_id' })

export default Location
