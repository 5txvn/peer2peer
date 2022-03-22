const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const chalk = require("chalk");

const StormDB = require("stormdb");
const { append } = require("express/lib/response");
const dbEngine = new StormDB.localFileEngine("./db/logins.db");
const db = new StormDB(dbEngine);
db.default({"questions": []})

router.get("/", (req, res) => {
  if (req.useragent.isBot) {
    res.send("oops, you are a bot!")
  } else {
    res.render("pages/login");
  }
});

router.post("/", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const data = db.state[username];
  if (bcrypt.compareSync(password, data.password)) {
    req.session.username = username;
    res.cookie("username", username)
    res.redirect("/");
  } else {
    res.send("wrong password");;
  }
});

module.exports = router;