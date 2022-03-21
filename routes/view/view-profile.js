const express = require('express');
const router = express.Router();
const session = require('express-session');

const StormDB = require("stormdb");

router.get('/:username', (req, res) => {
    const engine = new StormDB.localFileEngine("./db/logins.db")
const db = new StormDB(engine);
    const usernames = Object.keys(db.state);
        if (usernames.includes(req.params.username)) {
            const data = db.state[req.params.username];
            const name = req.session.name
            res.render("pages/view-profile", {
                username: req.params.username,
                questionsAsked: data["questions-asked"],
                questionsAnswered: data["questions-answered"],
                u: req.session.username,
                t: req.params.username
            })
        }
})

module.exports = router