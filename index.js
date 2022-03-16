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
const fs = require('fs');

//stormdb stuff
const StormDB = require("stormdb");
const loginsEngine = new StormDB.localFileEngine("./db/logins.db");
const logins = new StormDB(loginsEngine);
const messagesEngine = new StormDB.localFileEngine("./db/messages.db");
const messagesDB = new StormDB(messagesEngine);
//questionsDB.default({"questions": []})
messagesDB.default({"messages": []})

//for feedback emailing
/*
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'stevanosprojects@gmail.com',
    pass: process.env.EMAILPASS
  }
});
*/

//routes and stuff
app.use('/', require('./routes/home'));
app.use('/question', require('./routes/view/view-question'));
//app.use('/about', require('./routes/navbar/about'));
app.use('/login', require('./routes/auth/login'));
app.use('/signup', require('./routes/auth/signup'));
app.use('/dashboard', require('./routes/basic/dashboard'));
app.use('/submit-question', require('./routes/submit/submit-question.js'))
app.use('/landing', require('./routes/basic/landing'));
app.use('/feedback', require('./routes/submit/feedback'));
//basic
app.use('/about', require('./routes/basic/about'));
//app.use('*', require('./routes/basic/404'));

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
  res.redirect(`/user/${req.session.username}`);
})

/*
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
*/

app.get('/dm/:id', (req, res) => {
  res.render('pages/dm')
})

app.get('/main', (req, res) => {
  res.render('pages/main-room')
})

app.get('/filter/:word', (req, res) => {
  res.render('pages/filter')
})


io.on("connection", socket => {
  
  const questionsEngine = new StormDB.localFileEngine("./db/questions.db");
const questionsDB = new StormDB(questionsEngine);
  const questionIds = questionsDB.state.questions
  var questions = [];
  questionIds.forEach((question, num) => {
    questions.push({
      subject: questionsDB.state[question].subject,
      topic: questionsDB.state[question].topic,
      username: questionsDB.state[question].username,
      time: questionsDB.state[question].time,
      date: questionsDB.state[question].date,
      id: questionIds[num]
    })
  })
  
  //const emit = questions
  
  socket.emit('questions', questions)
  socket.on('message', data => {
    messagesDB.get("messages").push(data)
    messagesDB.save()
    io.emit("recieve", data)
    console.log(data)
  })

  socket.on("send", (message, name, id) => {
    console.log("reached")
    io.emit("recieve", message, name, id);
  })

socket.on("question-responses", (questionId) => {
  socket.emit("recieve-responses", questionsDB.state[questionId].responses)
})

  socket.emit("messages", messagesDB.state.messages)
  console.log("Recieved filter request")
  socket.on("filter", (word) => {
    var questions = []
    console.log(word)
    var count = 0
    Object.entries(questionsDB.state).forEach((id, data) => {
      if (count != 0) {
        
        if (id[1].topic.includes(word)) {
          id[1].url = `/question/${id[0]}`
          questions.push(id[1])
        }
        
        
        
       /*
        console.log(0)
        console.log(id[0])
        console.log(1)
        var chingchong = id[1]
        console.log(chingchong.topic)
        console.log(count)
        */
        
      }
      /*
      console.log(0)
      console.log(id[0])
      console.log(1)
      var chingchong = id[1]
      console.log(chingchong.topic)
      console.log(count)
      */
      
      count += 1
    })
    console.log(questions)
    socket.emit(`filter-${word}`, questions)
    console.log("Sent filter request back")
  })
  


  
    const filepath = 'index.ejs'

    var data = fs.readFileSync(`./views/${filepath}`, "utf8");
  setInterval(() => {
    if (data != fs.readFileSync(`./views/${filepath}`, "utf8")) {
      socket.emit("reload");
      data = fs.readFileSync(`./views/${filepath}`, "utf8");
    }
  }, 100)
  
})

//listen at port 3000

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log("Server started")
});
