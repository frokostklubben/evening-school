import { DataTypes } from 'sequelize'
import sequelize from '../database.js'
import School from './school.js'
import Role from './Role.js'

const User = sequelize.define(
  'User',
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    school_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
      allowNull: false,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Role,
        key: 'role_id'
      }
    }
  },
  {
    timestamps: false,
    tableName: 'users',
  },
)

export default User
