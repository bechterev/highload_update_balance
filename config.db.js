require('dotenv').config();
console.log(process.env.DB_NAME, process.env.DB_POOL_MAX, process.env.DB_POOL_MIN)

module.exports = {
  development: {
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    pool: {
      max: 30,
      min: 0,
      acquire: process.env.DB_POOL_ACQUIRE,
      idle: process.env.DB_POOL_IDLE
    },
  },
};