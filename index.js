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
const useragent = require('express-useragent');
app.use(useragent.express());
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
app.use('/about', require('./routes/navbar/about'));
app.use('/login', require('./routes/auth/login'));
app.use('/signup', require('./routes/auth/signup'));
app.use('/dashboard', require('./routes/basic/dashboard'));
app.use('/submit-question', require('./routes/submit/submit-question.js'))

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

app.get('/landing', (req, res) => {
  res.render('pages/landing');
})

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

app.get('/feedback', (req, res) => {
  if (!req.session.username) {
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

const PORT = process.env.PORT || 3000;

server.listen(PORT);
