const express = require('express');
const router = express.Router();
const path = require('path')
//router.set('view engine', 'ejs');
//router.set('views', path.join(__dirname, '../views'))
const StormDB = require("stormdb");
const questionsEngine = new StormDB.localFileEngine("./db/questions.db");
const questionsDB = new StormDB(questionsEngine);


router.get('/:id', (req, res) => {
    
    if (Object.keys(questionsDB.state).includes(req.params.id)) {
        const data = questionsDB.state[req.params.id]
        console.log(data)
        res.render('pages/view-question', {
            username: data.username,
            subject: data.subject,
            topic: data.topic,
            explanation: data.explain
        })
    } else {
        res.send("Not a valid question id, please re-enter your question id into the address bar and try again.")
    }
})

module.exports = router