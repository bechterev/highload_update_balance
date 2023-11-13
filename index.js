const express = require('express');
const { sequelize, User, initializeDatabase } = require('./database/db');
const userRoutes = require('./user/user.route');
require('dotenv').config();

const app = express();
const port = process.env.APP_PORT || 3000;

initializeDatabase();

app.use('/', userRoutes);

// app.listen(port, () => {
//   console.log(`Server is running at http://localhost:${port}`);
// });

module.exports = app
