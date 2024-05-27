import { DataTypes } from 'sequelize'
import sequelize from '../database.js'

const Inventory = sequelize.define(
  'Inventory',
  {
    inventory_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    item_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: 'inventory',
  },
)

export default Inventory
