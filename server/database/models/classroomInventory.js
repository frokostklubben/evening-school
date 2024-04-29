import sequelize from '../database.js'
import Classroom from './classroom.js'
import Inventory from './inventory.js'

const Classroom_inventory = sequelize.define(
  'Classroom_inventory',
  {},
  {
    timestamps: false,
  },
)

Inventory.belongsToMany(Classroom, {
  through: 'Classroom_inventory',
  foreignKey: 'inventory_id',
})
Classroom.belongsToMany(Inventory, {
  through: 'Classroom_inventory',
  foreignKey: 'room_id',
})

export default Classroom_inventory
