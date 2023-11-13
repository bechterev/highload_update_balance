const express = require('express');
const { workersTasks } = require('../cron_tasks/cron.service'); 

const router = express.Router();

router.get('/process', async (req, res) => {
  if (workersTasks) {
    console.log(workersTasks);
    res.json(workersTasks);
  } else {
    console.log('workersTasks is undefined');
    res.status(500).json({ error: 'workersTasks is undefined' });
  }
});

module.exports = router;
