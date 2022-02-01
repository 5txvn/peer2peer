const express = require('express');
const router = express.Router();

const StormDB = require("stormdb");
const engine = new StormDB.localFileEngine("./db/logins.db");
const db = new StormDB(engine);

router.get('/', (req, res) => {
    res.render('pages/singup')
})

router.post("/", (req, res) => {
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
      db
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

module.exports = router;