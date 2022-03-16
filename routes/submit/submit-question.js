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
    const today = new Date();
const yyyy = today.getFullYear();
let mm = today.getMonth() + 1; // Months start at 0!
let dd = today.getDate();

if (dd < 10) dd = '0' + dd;
if (mm < 10) mm = '0' + mm;
const utcString = today.toUTCString()
const array = utcString.split(" ")
const time = array[array.length - 2]
const questionsAsked = logins.state[req.session.username]["questions-asked"] + 1
console.log(questionsAsked)
    const date = `${dd}/${mm}/${yyyy}`;
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
    .set("date", date)
    .set("time", time)
    .set("responses", [])
    db.save()
    logins.get(req.session.username)
    .get("questions-asked")
    .set(questionsAsked)
    logins.save()
    res.redirect('/')
})

module.exports = router;