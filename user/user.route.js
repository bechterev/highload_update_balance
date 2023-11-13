const express = require('express');
const { sequelize, User } = require('../database/db');
const { updateBalance } = require('./user.service')

const router = express.Router();

router.put('/updateBalance/:userId/:amount', async (req, res) => {
  const userId = req.params.userId;
  const amount = parseInt(req.params.amount);

  const user = await User.findByPk(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const result = await updateBalance(user, amount);
  if (result.error) {
    return res.status(result.error === 'User balance must be greater than zero' ? 400 : 500)
      .json({ error: result.error });
  }

  return res.json(result);
});

module.exports = router;
