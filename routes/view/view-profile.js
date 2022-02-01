const express = require('express');
const router = express.Router();
const session = require('express-session');

const StormDB = require("stormdb");
const engine = new StormDB(new StormDB.localFileEngine("./db/logins.db"));
const db = new StormDB(engine);

router.get('/profile', (req, res) => {
    res.redirect(`/user/${req.session.username}`);
})

router.get('/user/:username', (req, res) => {
    const usernames = Object.keys(logins.state);
    if (!req.session.username) {
        res.redirect('/');
    } else {
        if (usernames.includes(req.params.username)) {
            const data = db.state[req.params.username];
            const name = data.name ? data.name : "No name";
            res.render("pages/profile", {
                username: req.params.username,
                name: name,
                id: data.id,
            })
        }
    }
})