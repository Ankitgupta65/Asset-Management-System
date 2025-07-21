const nodemailer = require('nodemailer');
require('dotenv').config();

console.log("📨 MAILER: Email user:", process.env.EMAIL); // Add this
console.log("📨 MAILER: Email pass:", process.env.EMAIL_PASS ? "Loaded" : "Missing"); // Add this

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS
  }
});

const sendComplaintStatusEmail = async (to, subject, status) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to,
    subject: `Complaint ${status}`,
    html: `
      <p>Hello,</p>
      <p>Your complaint about "<strong>${subject}</strong>" has been <strong>${status}</strong> by the IT Admin.</p>
      <p>Thanks,<br/>IT Support Team</p>
    `,
  };

  console.log(`📤 Sending email to: ${to} | Subject: Complaint ${status}`);

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
  } catch (err) {
    console.error("❌ Error sending email:", err.message);
  }
};

module.exports = sendComplaintStatusEmail;
