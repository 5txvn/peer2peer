//all express and socket.io related stuff
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const session = require("express-session");
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
}))
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.static("views"));
app.use(express.urlencoded({ extended: true }));
const logger = require("morgan");
app.use(logger("dev"));
app.use(express.json())
const server = require("http").createServer(app);
const io = require("socket.io")(server);

//other modules
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const nodemailer = require('nodemailer');
require('dotenv').config()

const StormDB = require("stormdb");
const req = require("express/lib/request");
//const req = require("express/lib/request");
const loginsEngine = new StormDB.localFileEngine("./db/logins.db");
const logins = new StormDB(loginsEngine);
const questionsEngine = new StormDB.localFileEngine("./db/questions.db");
const questionsDB = new StormDB(questionsEngine);
questionsDB.default({"questions": []})

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'stevanosprojects@gmail.com',
    pass: process.env.EMAILPASS
  }
});

app.get("/", (req, res) => {
  if (!req.cookies.id) {
    res.render("pages/login");
  } else {
    res.render("index");
  }
  console.log(req.session)
});


app.get("/signup", (req, res) => {
  res.render("pages/signup");
});


app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const data = logins.state[username];
  if (bcrypt.compareSync(password, data.password)) {
    console.log("logged in");
    res.cookie("id", data.id);
    res.cookie("username", username);
    res.cookie("password", data.password);
    res.cookie("email", data.email);
    res.cookie("name", data.name);
    req.session.test = "test"
  }
  res.redirect("/");
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
    .set("username", req.cookies.username)
    questionsDB.save()

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
  questionIds.forEach(question => {
    questions.push({
      subject: questionsDB.state[question].subject,
      topic: questionsDB.state[question].topic,
      username: questionsDB.state[question].username
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
