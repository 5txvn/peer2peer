const express = require('express')
const router = express.Router()

const StormDB = require("stormdb");
const engine = new StormDB.localFileEngine("./db/questions.db");
const db = new StormDB(engine);
db.default({"questions": []})

router.get('/', (req, res) => {
    res.render('pages/submit-question');
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
    console.log(`${chalk.blue(req.session.username)} has submitted a question.\nQuestion subject: ${chalk.cyan(subject)}\nQuestion topic: ${chalk.magenta(topic)}\nIp: ${chalk.red(req.headers['x-forwarded-for'])}`);
    res.redirect('/')
})

module.exports = router;