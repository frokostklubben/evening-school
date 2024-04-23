import { DataTypes } from 'sequelize';
import sequelize from '../database.js';
import user from './user.js';

const school = sequelize.define(
  'School',
  {
    school_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: user,
        key: 'user_id',
      },
    },
  },
  {
    timestamps: false,
    tableName: 'schools',
  },
);

await sequelize.sync();

export default school;
