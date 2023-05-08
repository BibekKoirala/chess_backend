const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'bibek.high@gmail.com',
    pass: 'ulgvahbfsuxbrcxs' // naturally, replace both with your real credentials or an application-specific password
  }
});


const sendMail = async (to, subject, text) =>{
    const mailOptions = {
        from: 'bibek.high@gmail.com',
        to: to,
        subject: subject,
        html: text,
      };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}

module.exports = sendMail;
