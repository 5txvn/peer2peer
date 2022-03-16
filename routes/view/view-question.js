const express = require('express');
const router = express.Router();
const path = require('path')
//router.set('view engine', 'ejs');
//router.set('views', path.join(__dirname, '../views'))
const StormDB = require("stormdb");


router.get('/:id', (req, res) => {
    const questionsEngine = new StormDB.localFileEngine("./db/questions.db");
const questionsDB = new StormDB(questionsEngine);
    if (Object.keys(questionsDB.state).includes(req.params.id)) {
        const data = questionsDB.state[req.params.id]
        console.log(data)
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
const id = req.params.id
const name = req.session.name
    const response = req.body.response
    /*
    console.log(name)
    console.log(response)
    console.log(id)
    */
    questionsDB.get(id).get("responses").push([name, response]).save()
    //console.log(response)
    res.redirect('/')
})

module.exports = router