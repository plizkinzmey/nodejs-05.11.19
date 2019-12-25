const express = require("express");
const cors = require("cors");
const consolidate = require("consolidate");
const path = require("path");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");

mongoose.connect("mongodb://localhost:32771/tasks", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

const Task = require("./models/task");
const User = require("./models/user");

const secretKey = "super secret key";
const token = {};
const app = express();
app.use(cors({}));
app.engine("hbs", consolidate.handlebars);
app.set("view engine", "hbs");
app.set("views", path.resolve(__dirname, "views"));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const checkAuthentication = (req, res, next) => {
  if (req.headers.authorization) {
    const [type, token] = req.headers.authorization.split(" ");

    jwt.verify(token, secretKey, (err, decoded) => {
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

app.use("/tasks", checkAuthentication);

app.get("/tasks", async (req, res) => {
  const response = await fetch("http://localhost:3000/tasks", {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token.value}`
    }
  })
    .then(responce => responce.json())
    .then(tasks => console.log(tasks));

  const { page = 1, limit = 10 } = req.query;
  console.log(req.query);
  const tasks = await Task.find()
    .skip((page - 1) * limit)
    .limit(limit);

  res.status(200).json(tasks);
});

app.get("/tasks/:id", async (req, res) => {
  const task = await Task.findById(req.params.id);
  res.status(200).json(task);
});

app.post("/tasks", async (req, res) => {
  const task = new Task(req.body);
  task
    .save()
    .then(savedTask => {
      res.status(201).json(savedTask);
    })
    .catch(() => {
      res.status(400).json({ message: "Validation error" });
    });
});

app.put("/tasks/:id", async (req, res) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id },
    { $set: req.body }
  );
  res.status(200).json(task);
});

app.path("/tasks/:id", async (req, res) => {
  const task = await Task.findById(req.params.id).lean();
  const modifiedTas = await Task.findOneAndUpdate(
    { _id: req.params.id },

    { $set: { ...task, ...req.body } }
  );
  res.status(200).json(modifiedTas);
});

app.delete("/tasks/:id", async (req, res) => {
  await Task.findOneAndRemove({ _id: req.params.id });
  res.status(204).send();
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const { repassword, ...restBody } = req.body;
  console.log(req.body);
  if (restBody.password === repassword) {
    const user = new User(restBody);
    await user.save();
    res.redirect("/auth");
    res.status(201).send();
  } else {
    res.status(400).json({ message: "Пароли не совпадают" });
  }
});

app.get("/auth", (req, res) => {
  const { error } = req.query;
  res.render("auth", { error });
});

app.post("/auth", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    res.status(400).json({ message: "Пользователь не найден" });
  }

  if (!user.validatePassword(password)) {
    res.status(401);
  }

  const plainUser = JSON.parse(JSON.stringify(user));
  delete plainUser.password;

  res.status(200);

  token.value = jwt.sign({ plainUser }, secretKey);

  const response = await fetch("http://localhost:3000/tasks", {
    headers: {
      "Content-type": "application/json",
      authorization: `Bearer ${token.value}`
    }
  }).then(res.redirect("/tasks"));
  /* .then(tasks => console.log(tasks)); */
  res.redirect("/tasks");
});

app.listen(3000, () => {
  console.log("Server has started!");
});
