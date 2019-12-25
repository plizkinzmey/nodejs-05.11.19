// подключаем схему
const Task = require('../../models/task');

// функция добавления/изменения/просмотра/удаления задач коллекции
module.exports = function(app, db) {

  // показать все задачи коллекции
  app.get('/tasks/all', async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const { _id } = req.user;
  
    const tasks = await Task.find({user: _id}).skip((page - 1) * limit).limit(limit);
  
    res.status(200).json(tasks);
  });

  // получить конкретную задачу из коллекции по id
  app.get('/tasks/:id', async (req, res) => {
    const task = await Task.findById(req.params.id);
  
    res.status(200).json(task);
  });

  // добавить задачу в коллекцию
  app.post('/tasks', (req, res) => {
    const { _id } = req.user;
    const task = new Task({...req.body, user: _id});
  
    task.save()
      .then((savedTask) => {
        res.status(201).json(savedTask);
      })
      .catch(() => {
        res.status(400).json({ message: 'Validation error' });
      });
  });

  // удалить задачу из коллекции
  app.delete('/tasks/:id', async (req, res) => {
    await Task.findOneAndRemove({ _id: req.params.id });
  
    res.status(204).send();
  });

  // обновить данные задачи в коллекции (full)
  app.put('/tasks/:id', async (req, res) => {
    const task = await Task.findOneAndUpdate({ _id: req.params.id }, { $set: req.body });
  
    res.status(200).json(task);
  });

  // обновить данные задачи в коллекции (parts)
  app.patch('/tasks/:id', async (req, res) => {
    const task = await Task.findById(req.params.id).lean();
  
    const modifiedTask = await Task.findOneAndUpdate({ _id: req.params.id }, { $set: {...task, ...req.body} });
  
    res.status(200).json(modifiedTask);
  });

}
