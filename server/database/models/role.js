import { DataTypes } from 'sequelize'
import sequelize from '../database.js'

const Role = sequelize.define(
    'role',
    {
        role_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    },
    {
        timestamps: false,
        tableName: 'roles'
    }
)

export default Role
