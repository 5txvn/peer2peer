require("dotenv").config();

//all express and socket.io related stuff
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const session = require("express-session");
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.static("views"));
app.use(express.urlencoded({ extended: true }));
const useragent = require("express-useragent");
app.use(useragent.express());
app.use(express.json());
const server = require("http").createServer(app);
const io = require("socket.io")(server);

//other modules
const crypto = require("crypto");
const bcrypt = require("bcrypt");
//const nodemailer = require('nodemailer');
const chalk = require("chalk");
const fs = require("fs");

//stormdb stuff
const StormDB = require("stormdb");
const messagesEngine = new StormDB.localFileEngine("./db/messages.db");
const messagesDB = new StormDB(messagesEngine);
messagesDB.default({ messages: [] });

//routes and stuff
app.use("/", require("./routes/home"));
app.use("/question", require("./routes/view/view-question"));
//app.use('/about', require('./routes/navbar/about'));
app.use("/login", require("./routes/auth/login"));
app.use("/signup", require("./routes/auth/signup"));
app.use("/dashboard", require("./routes/basic/dashboard"));
app.use("/submit-question", require("./routes/submit/submit-question.js"));
app.use("/landing", require("./routes/basic/landing"));
app.use("/feedback", require("./routes/submit/feedback"));
app.use("/user", require("./routes/view/view-profile.js"));
app.use("/about", require("./routes/basic/about"));
app.use("/resources", require("./routes/basic/resources"));
app.use("/dm", require("./routes/basic/dm"));
app.use("/filter", require("./routes/basic/filter"));
app.use("/main", require("./routes/basic/main"));
app.use("/profile", require("./routes/view/profile"));

app.get('/edit-profile', (req, res) => {
  res.render('pages/edit-profile')
})

app.post('/edit-profile', (req, res) => {
  const { background, grade, description } = req.body;
  const loginsEngine = new StormDB.localFileEngine("./db/logins.db");
  const loginsDB = new StormDB(loginsEngine);
  console.log(req.body)
  //loginsDB.get(req.session.username).set({background: background}).set({grade: grade}).set({description: description}).save();
})

app.post("/start-dm", (req, res) => {
  const loginsEngine = new StormDB.localFileEngine("./db/logins.db");
  const logins = new StormDB(loginsEngine);
  const id = crypto.randomBytes(8).toString("hex");
  logins
    .get(req.body.username)
    .get("notifications")
    .push([
      `<a style="color:white;font-weight:bold;text-decoration:none;" href="/dm/${id}">${req.body.clientusername}</a> has started a direct message conversation with you.`,
      id,
    ])
    .save();
  logins
    .get(req.body.username)
    .get("dms")
    .push([req.body.clientusername, id])
    .save();
  logins
    .get(req.body.clientusername)
    .get("dms")
    .push([req.body.username, id])
    .save();
  res.redirect("/");
});

io.on("connection", (socket) => {
  const questionsEngine = new StormDB.localFileEngine("./db/questions.db");
  const questionsDB = new StormDB(questionsEngine);
  questionsDB.default({ questions: [] });
  const dmEngine = new StormDB.localFileEngine("./db/dms.db");
  const dmDB = new StormDB(dmEngine);
  const loginsEngine = new StormDB.localFileEngine("./db/logins.db");
  const logins = new StormDB(loginsEngine);
  var questions = [];
  const questionIds = questionsDB.state.questions;
  questionIds.forEach((question, num) => {
    questions.push({
      subject: questionsDB.state[question].subject,
      topic: questionsDB.state[question].topic,
      username: questionsDB.state[question].username,
      questionsAsked:
        logins.state[questionsDB.state[question].username]["questions-asked"],
      questionsAnswered:
        logins.state[questionsDB.state[question].username][
          "questions-answered"
        ],
      time: questionsDB.state[question].time,
      date: questionsDB.state[question].date,
      id: questionIds[num],
    });
  });
  socket.emit("questions", questions);
  socket.on("message", (data) => {
    messagesDB.get("messages").push(data);
    messagesDB.save();
    io.emit("recieve", data);
  });

  socket.on("send", (message, name, id) => {
    if (dmDB.state.ids.includes(id)) {
      dmDB.get(id).push([name, message]).save();
    } else {
      dmDB.get("ids").push(id).save();
      dmDB.set(id, []).get(id).push([name, message]).save();
    }
    io.emit("recieve", message, name, id);
  });

  socket.on("recieve-messages", (id) => {
    if (dmDB.state.ids.includes(id)) {
      socket.emit(`dm-messages-${id}`, dmDB.state[id]);
    } else {
      socket.emit(`dm-messages-${id}`, []);
    }
  });

  socket.on("question-responses", (questionId) => {
    socket.emit("recieve-responses", questionsDB.state[questionId].responses);
  });

  socket.on("notification-request", (data) => {
    socket.emit(
      `notification-response-${data}`,
      logins.state[data].notifications
    );
  });

  socket.on("dm-request", (data) => {
    socket.emit(`dm-response-${data}`, logins.state[data].dms);
  });
  socket.on("get-messages", () => {
    socket.emit("messages", messagesDB.state.messages);
  });
  socket.on("filter", (word) => {
    var questions = [];
    var count = 0;
    Object.entries(questionsDB.state).forEach((id, data) => {
      if (count != 0) {
        if (id[1].topic.includes(word)) {
          id[1].url = `/question/${id[0]}`;
          questions.push(id[1]);
        }
      }
      count += 1;
    });
    socket.emit(`filter-${word}`, questions);
  });
});
app.use("*", require("./routes/basic/404"));
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log("Server started");
});
