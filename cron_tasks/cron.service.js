const cron = require('node-cron');
const cluster = require('cluster');
const { Task } = require('../database/db');
const app = require('../index');
require('dotenv').config();

const numCPUs = 5;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const workers = [];
let workersTasks = new Map();

async function processTask(taskName, func, paramFunc) {
  // Проверяем, есть ли свободные дочерние процессы
  let match = false;
  let sizes = [];
  for(const workerId of workersTasks.keys()) {
    const tasks = workersTasks.get(workerId)
    sizes.push([workerId, tasks.size]);
    if (tasks.has(taskName)) {
      match = true;
      break;
    }
  }
  console.log(match, taskName);
  if (!match) {
    if (sizes.length > 0) {
      sizes.sort((a, b) => a[1] - b[1]);
      const workerId = sizes[0][0];
      let tasks = workersTasks.get(workerId);
      tasks.set(taskName, new Date().getTime());
      console.log(workerId, tasks);
      func = func.toString();
      workers[workerId - 1].send({ taskName, task: func, param: paramFunc });
    }
    else {
      let tasks = new Map([taskName, new Date().getTime()]);
      const firstWorker = workers[0];
      workersTasks.set(firstWorker.id, tasks);
      func = func.toString();
      firstWorker.send({ taskName, task: func, param: paramFunc });
    }
  }

}


// Проверяем, является ли текущий процесс главным
if (cluster.isPrimary) {
  // Создаем дочерние процессы
  for (let i = 0; i < numCPUs; i++) {
    const worker = cluster.fork();
    workers.push(worker);
    console.log(`worker create ${worker.id} ${worker.process.pid}`)
    workersTasks.set(worker.id, new Map());
  }

  // Отслеживаем сообщения от дочерних процессов
  cluster.on('message', (worker, message) => {
    // Ваша логика обработки сообщения
    console.log(`Message from worker ${worker.process.pid}: woker_id: ${worker.id} - complete ${message}`);

    const tasks = workersTasks.get(worker.id);
    if (tasks) {
      const startTime = tasks.get(message);
      Task.create({name: message, worker: worker.id, duration: new Date().getTime() - startTime})
      tasks.delete(message);
    }
  });

  app.get('/process', (req, res) => {
    const tasksArray = Array.from(workersTasks.entries()).map(([key, value]) => ({
      worker: key,
      tasks: mapToObject(value),
    }));
  
    res.json(tasksArray);
  });
  
  function mapToObject(inputMap) {
    const arr = [];
    inputMap.forEach((value, key) => {
      let obj = {};
      obj[key] = new Date().getTime() - value;
      arr.push(obj);
    });
    return arr;
  }

  const port = process.env.APP_PORT || 3000;
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });

  // Обработка задач из cron в главном процессе
  cron.schedule('*/30 * * * * *',  () => {
    // Your task logic goes here
    const taskName = 'TaskName 1';
    processTask(taskName, delay, 120000);
  });

  cron.schedule('*/30 * * * * *', () => {
    // Your task logic goes here
    const taskName = 'TaskName 2';
    processTask(taskName,  delay, 120000);

  });

  cron.schedule('*/15 * * * * *', () => {
    // Your task logic goes here
    const taskName = 'TaskName 3';
    processTask(taskName, delay, 120000);
  });

  cron.schedule('*/21 * * * * *', () => {
    // Your task logic goes here
    const taskName = 'TaskName 4';
    processTask(taskName, delay, 120000);
  });

  cron.schedule('*/18 * * * * *', () => {
    // Your task logic goes here
    const taskName = 'TaskName 5';
    processTask(taskName, delay, 120000);
  });

  cron.schedule('*/44 * * * * *', () => {
    // Your task logic goes here
    const taskName = 'TaskName 6';
    processTask(taskName, delay, 120000);
  });

  cron.schedule('*/39 * * * * *', () => {
    // Your task logic goes here
    const taskName = 'TaskName 7';
    processTask(taskName, delay, 120000);
  });

  cron.schedule('*/51 * * * * *', () => {
    // Your task logic goes here
    const taskName = 'TaskName 8';
    processTask(taskName, delay, 120000);
  });

  cron.schedule('*/28 * * * * *', () => {
    // Your task logic goes here
    const taskName = 'TaskName 9';
    processTask(taskName, delay, 120000);
  });

  cron.schedule('*/54 * * * * *', () => {
    // Your task logic goes here
    const taskName = 'TaskName 10';
    processTask(taskName, delay, 120000);
  });

} else {
  // В дочерних процессах выполняем код задачи
  process.on('message', async (message) => {

    const { taskName, task, param } = message;
    var asyncFn = new Function('return ' + task)();
    console.log(`child process ${taskName} started, task ${process.pid}`)
    // Ваша логика выполнения задачи
    await asyncFn(param);

    // Сообщаем главному процессу, что задача выполнена
    process.send(taskName);

  });
}

module.exports = {
  workersTasks,
};