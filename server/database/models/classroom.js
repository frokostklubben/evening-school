import { DataTypes } from 'sequelize';
import sequelize from '../database.js';
import location from './location.js';

const classroom = sequelize.define(
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
        model: location,
        key: 'location_id',
      },
    },
    purpose: {
      type: DataTypes.STRING,
      allowNull: true,
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
);

try {
  await sequelize.sync();
  console.log('Classroom table was just (re)created successfully!');
} catch (error) {
  console.error('Error updating the classroom table:', err);
  throw err;
}

export default classroom;
