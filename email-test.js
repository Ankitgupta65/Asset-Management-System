
require('dotenv').config();
console.log("EMAIL:", process.env.EMAIL);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS);


const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS
  }
});

transporter.sendMail({
  from: process.env.EMAIL,
  to: process.env.EMAIL,  // send to yourself
  subject: 'Test Email',
  text: 'This is a test email'
}, (err, info) => {
  if (err) {
    console.error('❌ Failed to send email:', err.message);
  } else {
    console.log('✅ Email sent:', info.response);
  }
});