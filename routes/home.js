const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    if (!req.session.username) {
      res.render('pages/landing')
      } else {
        res.render("index", {
          clientusername: req.session.username
        });
      }
})

module.exports = router;