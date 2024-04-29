import 'dotenv/config'
import { Sequelize } from 'sequelize'

const connection = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: 'localhost',
  dialect: 'mysql',
})

try {
  await connection.authenticate()
  console.log('Connection has been established successfully.')
} catch (error) {
  console.error('Unable to connect to the database:', error)
}

export default connection
