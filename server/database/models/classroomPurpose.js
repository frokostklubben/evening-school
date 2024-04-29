import { DataTypes } from 'sequelize'
import sequelize from '../database.js'

const Classroom_purpose = sequelize.define(
    'classroom_purpose',
    {
        purpose_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        purpose: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    },
    {
        timestamps: false,
        tableName: 'classroom_purposes'
    }
)

export default Classroom_purpose
