const express = require('express');
const router = express.Router();
const path = require('path')
const StormDB = require("stormdb");


router.get('/:id', (req, res) => {
    const questionsEngine = new StormDB.localFileEngine("./db/questions.db");
const questionsDB = new StormDB(questionsEngine);
    if (Object.keys(questionsDB.state).includes(req.params.id)) {
        const data = questionsDB.state[req.params.id]
        res.render('pages/view-question', {
            username: data.username,
            subject: data.subject,
            topic: data.topic,
            explanation: data.explain,
            id: req.params.id
        })
    } else {
        res.send("Not a valid question id, please re-enter your question id into the address bar and try again.")
    }
})

router.post('/:id', (req, res) => {
    const questionsEngine = new StormDB.localFileEngine("./db/questions.db");
const questionsDB = new StormDB(questionsEngine);
const loginsEngine = new StormDB.localFileEngine("./db/logins.db");
const loginsDB = new StormDB(loginsEngine);
const id = req.params.id
const name = req.session.username
    const response = req.body.response
    questionsDB.get(id).get("responses").push([name, response]).save()
    const answered = loginsDB.state[name]["questions-answered"]
    loginsDB.get(name).get("questions-answered").set(answered + 1).save()
    res.redirect('/')
})

module.exports = router