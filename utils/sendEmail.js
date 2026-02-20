const nodemailer = require('nodemailer');
const { EMAIL_USER, EMAIL_PASS, EMAIL_SERVICE } = require('../config/secret');

const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: EMAIL_SERVICE, // e.g. 'gmail'
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"No Reply" <${EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
