const express = require('express')
const router = express.Router()

const nodemailer = require('nodemailer')

router.get('/', (req, res) => {
    res.render('pages/feedback')
})

router.post('/', (req, res) => {
    const problem = req.body.problem
  const elaborate = req.body.elaborate

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'stevanosprojects@gmail.com',
      pass: process.env.EMAILPASS
    }
  });
  
  var mailOptions = {
    from: 'stevanosprojects@gmail.com',
    to: 'therealenny1@gmail.com',
    subject: 'Feedback from Peer2Peer',
    html: `<h2>${problem}</h2><p>${elaborate}</p>`
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

  res.redirect('/')
})

module.exports = router