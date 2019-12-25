const express = require('express');
const consolidate = require('consolidate');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();

mongoose.connect('mongodb://192.168.99.100:32768/todoList', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Task = require('./models/task');
const User = require('./models/user');

app.engine('hbs', consolidate.handlebars);
app.set('view engine', 'hbs');
app.set('views', path.resolve(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({
  extended: false,
}));

app.use(express.static(__dirname + '/public'));

app.use(cors());

const checkAuthorization = (req, res) => {
  if (req.headers.authorization) {
    const [type, token] = req.headers.authorization;

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
};

app.use(/\/((?!auth|registration).)*/, checkAuthorization);
app.all('/', (req, res) => {
  res.redirect('/tasks');
});

app.get('/tasks', async (req, res) => {
  const tasks = await Task.find();

  res.status(200).json(task);
});

app.get('/tasks/:id', async (req, res) => {
  const task = await Task.findById(req.params.id);

  res.status(200).json(task);
});

app.post('/tasks', async (req, res) => {
  const task = new Task(req.body)
  task.save()
    .then((savedTask) => {
      res.status(201).json(savedTask);
    })
    .catch(() => {
      res.status(400).json({ message: 'Validation error' });
    });
})

app.put('/tasks/:id', async (req, res) => {
  const task = await Task.findOneAndUpdate({ _id: req.params.id }, { $set: req.body });

  res.status(200).json(task);
})

app.patch('/tasks/:id', async (req, res) => {
  const task = await Task.findById(req.params.id).lean();

  const modifiedTask = await Task.findOneAndUpdate({ _id: req.params.id }, { $set: { ...task, ...req.body } });

  res.status(200).json(modifiedTask);
})

app.delete('/tasks', async (req, res) => {
  await Task.findOneAndRemove({ _id: req.body.id });

  res.status(204).send();
})

app.get('/registration', (req, res) => {
  res.render('registration');
});

app.get('/auth', (req, res) => {
  const { error } = req.query;
  res.render('auth', { error });
});

app.post('/auth', async (req, res) => {
  const { login, password } = req.body;

  const user = await User.findOne({ login });

  if (!user) {
    return res.status(401).send();
  }

  if (!user.validatePassword(password)) {
    return res.status(401).send();
  }

  const plainUser = JSON.parse(JSON.stringify(user));
  delete plainUser.password;

  res.status(200).json({
    ...plainUser,
    token: jwt.sign(plainUser, 'super secret key'),
  });
});

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/auth');
});

app.post('/registration', async (req, res) => {
  const { repassword, ...restBody } = req.body;

  if (restBody.password === repassword) {
    const user = new User(restBody);
    const errors = user.validateSync();
    
    if (errors) {
      res.status(400).json(errors);
    } else {
      await user.save();

      res.status(201).send();
    }
  } else {
    res.status(400).json({
      errors: {
        passConfirmation: false,
      }
    });
  }
});

app.listen(3000, () => {
  console.log('Server has been started');
});
