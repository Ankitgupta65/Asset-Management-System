// routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get all users (you can filter based on role too)
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, 'email'); // only return _id and email
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

module.exports = router;
