const express = require('express');
const { sequelize, User, initializeDatabase } = require('./db');
const routes = require('./user.route');
require('dotenv').config();

const app = express();
const port = process.env.APP_PORT || 3000;

initializeDatabase();

app.use('/', routes);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
