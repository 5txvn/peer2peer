const express = require('express')
const router = express.Router()

const StormDB = require("stormdb");
const engine = new StormDB.localFileEngine("./db/questions.db");
const db = new StormDB(engine);
db.default({"questions": []})
const loginsEngine = new StormDB.localFileEngine("./db/logins.db");
const logins = new StormDB(loginsEngine);

const crypto = require("crypto");

router.get('/', (req, res) => {
    res.render('pages/submit-question');
    console.log(logins.state)
})

router.post('/', (req, res) => {
    const subject = req.body.subject;
    const topic = req.body.topic;
    const explain = req.body.explain;
    const questionId = crypto.randomBytes(16).toString("hex");
    const questions = db.state.questions;
    db.get("questions")
    .push(questionId)
    db.set(questionId, {})
    db.get(questionId)
    .set("subject", subject)
    .set("topic", topic)
    .set("explain", explain)
    .set("username", req.session.username)
    db.save()
    logins.get(req.session.username)
    .get("questions-asked")
    .set(0)
    logins.save()
    res.redirect('/')
})

module.exports = router;