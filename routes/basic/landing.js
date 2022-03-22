const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    if (!req.session.username) {
        res.redirect('/')
    } else {
        res.render('pages/landing')
    }
})

module.exports = router;