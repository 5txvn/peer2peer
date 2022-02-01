const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.redirect('/user/' + req.cookies.username);
})

module.exports = router;