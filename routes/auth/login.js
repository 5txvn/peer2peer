const express = require('express')
const router = express.Router()
const session = require('express-session')
app.use(session({
    //
}))

router.get('/', (req, res) => {
    //
})

app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const data = logins.state[username];
    if (data.password === password) {
      res.cookie("id", data.id);
      res.cookie("username", username);
      res.cookie("password", data.password);
      res.cookie("email", data.email);
      res.cookie("name", data.name);
    }
    res.redirect("/");
  });