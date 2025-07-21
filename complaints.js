const express = require('express');
const router = express.Router();
const Complaint = require('../models/complaint');
const nodemailer = require('nodemailer');
require('dotenv').config();

// ✅ Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,       // <-- Make sure .env has EMAIL=
    pass: process.env.EMAIL_PASS   // <-- and EMAIL_PASS=
  }
});

// === ✅ Create a new complaint ===
router.post('/', async (req, res) => {
  try {
    const complaint = new Complaint(req.body);
    await complaint.save();
    res.status(201).json({ message: "Complaint submitted!" });
  } catch (err) {
    console.error("❌ Error creating complaint:", err.message);
    res.status(400).json({ message: 'Error creating complaint', error: err.message });
  }
});

// === ✅ Get all complaints (for IT Admin) ===
router.get('/', async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    console.error("❌ Error fetching complaints:", err.message);
    res.status(500).json({ message: 'Error fetching complaints', error: err.message });
  }
});

// === ✅ Update complaint status and send email ===
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Pending', 'Approved', 'Resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // ✅ Send status update email
    const mailOptions = {
      from: process.env.EMAIL,
      to: complaint.userEmail,
      subject: `Complaint ${status} - IT Department`,
      html: `
        <p>Hello,</p>
        <p>Your complaint "<strong>${complaint.subject}</strong>" has been <strong>${status}</strong> by the IT Admin.</p>
        <p>We will address it as soon as possible.</p>
        <p>Regards,<br/>IT Support Team</p>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent to ${complaint.userEmail}`);
    } catch (emailError) {
      console.error("❌ Failed to send email:", emailError.message);
      // Email sending failed, but still return success for the update
    }

    res.json({ message: `Complaint marked as ${status}`, complaint });

  } catch (err) {
    console.error("❌ Error updating complaint status:", err.message);
    res.status(500).json({ message: 'Failed to update complaint', error: err.message });
  }
});

module.exports = router;
