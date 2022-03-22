const express = require("express");
const router = express.Router();

router.get("/:word", (req, res) => {
  if (!req.session.username) {
    res.redirect("/");
  } else {
    res.render("pages/filter");
  }
});

module.exports = router;
