const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const otpStore = new Map();

// Register
router.post('/register', async (req, res) => {
  const { email, password, role } = req.body;
  console.log("📩 Register request:", req.body);

  if (!email || !password || !role)
    return res.status(400).json({ message: 'Email, password and role are required' });

  const existingUser = await User.findOne({ email });
  if (existingUser)
    return res.status(400).json({ message: 'User already exists' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email, { otp, password, role }); // ✅ save role too

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'OTP Verification',
    text: `Your OTP code is ${otp}`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent to ${email}: ${otp}`);
    res.status(200).json({ message: 'OTP sent to your email' });
  } catch (err) {
    console.error("❌ Email error:", err);
    res.status(500).json({ message: 'Email failed', error: err.message });
  }
});

// Verify OTP
router.post('/verify', async (req, res) => {
  const { email, otp } = req.body;
  console.log("🔐 Verifying OTP:", otp);

  const data = otpStore.get(email);
  if (!data || data.otp !== otp)
    return res.status(400).json({ message: 'Invalid or expired OTP' });

  try {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const newUser = new User({ email, password: hashedPassword, role: data.role }); // ✅ add role
    await newUser.save();
    otpStore.delete(email);

    res.status(200).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error("❌ Registration error:", err);
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log("📥 Login Request Body:", req.body);

  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required' });

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role }, // ✅ include role in token
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      role: user.role // ✅ return role
    });

  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

module.exports = router;
