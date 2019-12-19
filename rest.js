const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

mongoose.connect('mongodb://localhost:32772/tasks', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

const Task = require('./models/task');
const User = require('./models/user');

const app = express();

app.use(express.json());
app.use(cors());

const checkAuthentication = (req, res, next) => {
  // Authorization: Bearer <token>
  if (req.headers.authorization) {
    const [type, token] = req.headers.authorization.split(' ');

    jwt.verify(token, 'super secret key', (err, decoded) => {
      if (err) {
        return res.status(403).send();
      }

      req.user = decoded;

      next();
    });
  } else {
    res.status(403).send();
  }
}

app.use('/tasks', checkAuthentication);

app.get('/tasks', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const tasks = await Task.find().skip((page - 1) * limit).limit(limit);

  res.status(200).json(tasks);
});

app.get('/tasks/:id', async (req, res) => {
  const task = await Task.findById(req.params.id);

  res.status(200).json(task);
});

app.post('/tasks', (req, res) => {
  const task = new Task(req.body);

  task.save()
    .then((savedTask) => {
      res.status(204).json(savedTask);
    })
    .catch(() => {
      res.status(400).json({ message: 'Validation error' });
    });
});

app.put('/tasks/:id', async (req, res) => {
  const task = await Task.findOneAndUpdate({ _id: req.params.id }, { $set: req.body });

  res.status(200).json(task);
});

app.patch('/tasks/:id', async (req, res) => {
  const task = await Task.findById(req.params.id).lean();

  const modifiedTask = await Task.findOneAndUpdate({ _id: req.params.id }, { $set: {...task, ...req.body} });

  res.status(200).json(modifiedTask);
});

app.delete('/tasks/:id', async (req, res) => {
  await Task.findOneAndRemove({ _id: req.params.id });

  res.status(204).send();
});

app.post('/register', async (req, res) => {
  const { repassword, ...restBody } = req.body;

  if (restBody.password === repassword) {
    const user = new User(restBody);
    await user.save();

    res.status(201).send();
  } else {
    res.status(400).json({ message: 'User exists' });
  }
});

app.post('/auth', async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ email: username });

  if (!user) {
    return res.status(401);
  }

  if (!user.validatePassword(password)) {
    return res.status(401);
  }

  const plainUser = JSON.parse(JSON.stringify(user));
  delete plainUser.password;

  res.status(200).json({
    ...plainUser,
    token: jwt.sign(plainUser, 'super secret key'),
  });
});


app.listen(3000, () => {
  console.log('Server has started!');
});