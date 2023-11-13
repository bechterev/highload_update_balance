const { sequelize, User } = require('../database/db');
const { Transaction } = require('sequelize');

const RETRY_DELAY_MS = 50;
const TIME_CHECK_USER_BALANCE = 2000;
const balanceOfUsers = new Map();

const getUserById = async (userId) => {
  return await User.findByPk(userId);
};

const getBalance = async (user) => {
  const userId = user.id;
  if (balanceOfUsers.has(userId)) {
    return balanceOfUsers.get(userId);
  } else {
    const balanceData = {
      balance: user.balance,
      time: new Date().getTime(),
      ttl: 1000,
      lock: false,
    };
    balanceOfUsers.set(userId, balanceData);

    return balanceData;
  }
};

const iterateMapValues = async () => {
  const currentTime = new Date().getTime();
  const userIdsToDelete = [];

  for (const [userId, data] of balanceOfUsers) {
    if (currentTime > data.time + data.ttl) {
      data.lock = true;
      balanceOfUsers.set(userId, data);
      await updateBalanceTransaction(userId, data.balance);
      userIdsToDelete.push(userId);
    }
  }

  userIdsToDelete.forEach((userId) => balanceOfUsers.delete(userId));
};

const updateBalanceTransaction = async (userId, balance) => {
  try {
    await sequelize.transaction(
      { isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ },
      async (t) => {
        const updatedUser = await User.findByPk(userId, { transaction: t });
        await updatedUser.update({ balance }, { transaction: t });
      }
    );
  } catch (error) {
    throw error;
  }
};

const updateBalance = async (user, amount) => {
  try {
    const userId = user.id;
    const data = await getBalance(user);

    console.log(`data, ${data}`);

    if (data.lock) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }

    if (data.balance < amount) {
      throw new Error('User balance must be greater than zero');
    } else {
      data.balance -= amount;
      balanceOfUsers.set(userId, data);
      return { balance: data.balance, userId };
    }
  } catch (error) {
    return { error: error.message };
  }
};

const intervalId = setInterval(iterateMapValues, TIME_CHECK_USER_BALANCE);

module.exports = {
  getUserById,
  updateBalance,
};
