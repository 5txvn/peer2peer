const express = require('express');
const router = express.Router();

const StormDB = require("stormdb");
const engine = new StormDB.localFileEngine("./db/logins.db");
const db = new StormDB(engine);

const bcrypt = require("bcrypt");

router.get('/', (req, res) => {
    res.render('pages/signup')
})

router.post("/", (req, res) => {
    //hash the password
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);
    const usernames = Object.keys(db);
    const username = req.body.username;
    res.cookie("username", username)
    //set user data in sessions
    req.session.username = username
    if (!usernames.includes(username)) {
      //set the login data
      db
        .set(username, {})
        .get(username)
        .set("password", hash)
        .set("questions-asked", 0)
        .set("questions-answered", 0)
        .set("description", "No description yet (coming soon...)")
        .set("grade-level", "No grade level yet (coming soon...)")
        .set("notifications", [])
        .set("dms", [])
        .save();
    } else {
      res.redirect("/signup");
    }
    res.redirect("/");
  });

module.exports = router;