require('dotenv').config()

//all express and socket.io related stuff
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const session = require("express-session");
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
}))
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.static("views"));
app.use(express.urlencoded({ extended: true }));
const logger = require("morgan");
//app.use(logger("dev"));
app.use(express.json())
const server = require("http").createServer(app);
const io = require("socket.io")(server);


//other modules
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const nodemailer = require('nodemailer');
const chalk = require('chalk');

//stormdb stuff
const StormDB = require("stormdb");
const { red } = require("color-name");
const loginsEngine = new StormDB.localFileEngine("./db/logins.db");
const logins = new StormDB(loginsEngine);
const questionsEngine = new StormDB.localFileEngine("./db/questions.db");
const questionsDB = new StormDB(questionsEngine);
questionsDB.default({"questions": []})

//for feedback emailing
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'stevanosprojects@gmail.com',
    pass: process.env.EMAILPASS
  }
});

//routes and stuff
app.use('/question', require('./routes/view-question'));

app.get("/", (req, res) => {
  if (!req.session.username) {
    res.render("pages/landing");
    const ip = req.headers['x-forwarded-for']
    console.log(`An unregistered user has visited the landing page.\nIp: ${chalk.red(ip)}\n`);
  } else {
    res.render("index");
    const ip = req.headers['x-forwarded-for']
    const username = req.session.username
    console.log(`${chalk.blue(username)} has connected to the main page.\nIp: ${chalk.red(ip)}\n`);
  }
});

app.get('/login', (req, res) => {
  res.render('pages/login');
  console.log(`A user has visited the login page.\nIp: ${chalk.red(req.headers['x-forwarded-for'])}\n`);
})

app.get('/main', (req, res) => {
  res.render('index')
})


app.get("/signup", (req, res) => {
  res.render("pages/signup");
  console.log(`A user has visited the signup page.\nIp: ${chalk.red(req.headers['x-forwarded-for'])}\n`);
});

app.get('/landing', (req, res) => {
  res.render('pages/landing');
})


app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const data = logins.state[username];
  if (bcrypt.compareSync(password, data.password)) {
    console.log("logged in");
    req.session.username = username;
    req.session.email = data.email;
    req.session.name = data.name;
    res.redirect("/");
    console.log(`${chalk.blue(username)} has logged in.\nIp: ${chalk.red(req.headers['x-forwarded-for'])}\n`);
  } else {
    res.send("wrong password");
    console.log(`Failed attempt to login under the username ${chalk.blue(username)}.\nIp: ${chalk.red(req.headers['x-forwarded-for'])}\n`);
  }
});

app.post("/signup", (req, res) => {
  //hash the password
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(req.body.password, salt);
  const usernames = Object.keys(logins);
  const username = req.body.username;
  const email = req.body.email;
  const name = req.body.name;
  //set user data in sessions
  req.session.username = username
  req.session.email = email
  req.session.name = name
  if (!usernames.includes(username)) {
    //set the login data
    logins
      .set(username, {})
      .get(username)
      .set("password", hash)
      .set("name", name)
      .set("email", email)
      .save();
      console.log(`${chalk.blue(username)} has signed up. Ip: ${chalk.red(req.headers['x-forwarded-for'])}`);
  } else {
    res.redirect("/signup");
  }
  res.redirect("/");
});

app.get("/user/:username", (req, res) => {
  console.log("reached");
  const usernames = Object.keys(logins.state);
  if (req.cookies.id) {
    if (usernames.includes(req.params.username)) {
      const data = logins.state[req.params.username];
      const name = data.name ? data.name : "No name";
      res.render("pages/profile", {
        username: req.params.username,
        name: name,
        id: data.id,
      });
    }
  } else {
    res.redirect("/");
  }
});

app.get('/profile', (req, res) => {
  res.redirect('/user/' + req.cookies.username);
})

app.get('/about', (req, res) => {
  if (!req.cookies.id) {
    res.redirect('/');
  } else {
    res.render('pages/about');
  }
})

app.get('/submit-question', (req, res) => {
    res.render('pages/submit-question');
})

app.post('/submit-question', (req, res) => {
    const subject = req.body.subject;
    const topic = req.body.topic;
    const explain = req.body.explain;
    const questionId = crypto.randomBytes(16).toString("hex");
    const questions = questionsDB.state.questions;
    console.log(questions)
    questionsDB.get("questions")
    .push(questionId)
    questionsDB.set(questionId, {})
    questionsDB.get(questionId)
    .set("subject", subject)
    .set("topic", topic)
    .set("explain", explain)
    .set("username", req.session.username)
    questionsDB.save()
    console.log(`${chalk.blue(req.session.username)} has submitted a question.\nQuestion subject: ${chalk.cyan(subject)}\nQuestion topic: ${chalk.magenta(topic)}\nIp: ${chalk.red(req.headers['x-forwarded-for'])}`);
    res.redirect('/')
})

app.get('/feedback', (req, res) => {
  if (!req.cookies.id) {
    res.redirect('/');
  } else {
    res.render('pages/feedback');
  }
})

app.post('/feedback', (req, res) => {
  const problem = req.body.problem
  const elaborate = req.body.elaborate
  
  var mailOptions = {
    from: 'stevanosprojects@gmail.com',
    to: 'therealenny1@gmail.com',
    subject: 'Feedback from Peer2Peer',
    html: `<h2>${problem}</h2><p>${elaborate}</p>`
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

  res.redirect('/')
})

app.get('/edit', (req, res) => {
  res.render('pages/edit');
})

app.get('/dm/:id', (req, res) => {
  res.render('pages/dm')
})

app.get('*', (req, res) => {
  res.status(404).render('pages/404');
})

io.on("connection", socket => {
  const questionIds = questionsDB.state.questions
  var questions = [];
  questionIds.forEach((question, num) => {
    questions.push({
      subject: questionsDB.state[question].subject,
      topic: questionsDB.state[question].topic,
      username: questionsDB.state[question].username,
      id: questionIds[num]
    })
  })
  const emit = questions
  socket.emit('questions', emit)
  socket.emit("test", "test")

  socket.on("send", (message, id) => {
    console.log("reached")
    io.emit("recieve", message, id);
  })
})
/*
edit.on("connection", socket => {
  console.log("reached")
})
*/

const PORT = process.env.PORT || 3000;

server.listen(PORT);
