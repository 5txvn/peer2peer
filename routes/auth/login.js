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
    console.log("logged in");
    req.session.username = username;
    req.session.email = data.email;
    req.session.name = data.name;
    res.cookie("username", username)
    res.redirect("/");
    console.log(
      `${chalk.blue(username)} has logged in.\nIp: ${chalk.red(
        req.headers["x-forwarded-for"]
      )}\n`
    );
  } else {
    res.send("wrong password");
    console.log(
      `Failed attempt to login under the username ${chalk.blue(
        username
      )}.\nIp: ${chalk.red(req.headers["x-forwarded-for"])}\n`
    );
  }
});

module.exports = router;