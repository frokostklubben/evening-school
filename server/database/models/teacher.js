import { DataTypes } from 'sequelize';
import sequelize from '../database.js';

const Teacher = sequelize.define(
  'Teacher',
  {
    teacher_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    first_name: {
      type: DataTypes.STRING(55),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(55),
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: 'teachers',
  },
);

await sequelize.sync(); // { alter: true } ?

export default Teacher;
