import 'dotenv/config';
import { Sequelize } from 'sequelize';

let sequelize = new Sequelize(null, process.env.DB_USER, process.env.DB_PASS, {
  host: 'localhost',
  dialect: 'mysql',
});

try {
  await sequelize.authenticate();
  console.log('Connection has been established successfully.');
  await sequelize.query(`DROP DATABASE IF EXISTS ${process.env.DB_NAME}`)
  await sequelize.query(`CREATE DATABASE ${process.env.DB_NAME}`)
  console.log('DATABASE DROPPED AND CREATED');

  sequelize.close()

  sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: 'localhost',
    dialect: 'mysql',
  });
  
  await sequelize.authenticate();
} catch (error) {
  console.error('Unable to connect to the database:', error);
}

export default sequelize;
