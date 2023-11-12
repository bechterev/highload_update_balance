const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');
const config = require('./config.db');

dotenv.config();

const BALANCE_INIT = 10000;
const sequelize = new Sequelize(config.development);

const User = sequelize.define('User', {
  balance: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
    },
  },
},{
  timestamps: false,
})

const initializeDatabase = async () => {
  try {
    await sequelize.sync({ force: true });
    await User.create({ balance: BALANCE_INIT });
  } catch (error) {
    console.log('Error initializing database:', error);
  }
};

module.exports = {
  sequelize,
  User,
  initializeDatabase,
};
