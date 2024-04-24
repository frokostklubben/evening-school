import { DataTypes } from 'sequelize';
import sequelize from '../database.js';
import Classroom from './classroom.js'
import Inventory from './inventory.js';

const Classroom_inventory = sequelize.define(
    'Classroom_inventory',
    {
        room_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Classroom,
                key: 'room_id'
            },
        },
        
        inventory_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Inventory,
                key: 'inventory_id'
            }
        }
        
    }
)

try {
    await sequelize.sync()
    console.log('The table for the Classroom_inventory model was just (re)created')
} catch (error) {
    console.error('Unable to create or recreate the table:', error);
}

export default Classroom_inventory