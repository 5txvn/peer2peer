const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    if (!req.session.username) {
        res.render("pages/landing");
        const ip = req.headers['x-forwarded-for']
        console.log(`An unregistered user has visited the landing page.\nIp: ${chalk.red(ip)}\n`);
      } else {
        res.render("index");
        const ip = req.headers['x-forwarded-for']
        const username = req.session.username
        console.log(`${chalk.blue(username)} has connected to the main page.\nIp: ${chalk.red(ip)}\n`);
      }
})

module.exports = router;