const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("pages/login");
});

router.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const data = logins.state[username];
  if (bcrypt.compareSync(password, data.password)) {
    console.log("logged in");
    req.session.username = username;
    req.session.email = data.email;
    req.session.name = data.name;
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