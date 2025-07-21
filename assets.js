const express = require('express');
const router = express.Router();
const Asset = require('../models/Asset');
const User = require('../models/User');

// Get all assets (with optional filters)
router.get('/', async (req, res) => {
  const { status, minPrice, maxPrice, category } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category; // ✅ Include category filter
  if (minPrice || maxPrice) {
    filter.value = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }

  try {
    const assets = await Asset.find(filter).populate('assignedTo', 'email');
    res.json(assets);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching assets' });
  }
});

// Create new asset
router.post('/', async (req, res) => {
  try {
    console.log("🟢 Incoming asset:", req.body);
    const asset = new Asset(req.body);
    await asset.save();
    console.log("✅ Asset saved:", asset);
    res.status(201).json(asset);
  } catch (err) {
    console.error("❌ Error creating asset:", err.message);
    res.status(400).json({ message: 'Error creating asset', error: err.message });
  }
});

// Update asset
router.put('/:id', async (req, res) => {
  try {
    const updated = await Asset.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: 'Error updating asset' });
  }
});

// Delete asset
router.delete('/:id', async (req, res) => {
  try {
    await Asset.findByIdAndDelete(req.params.id);
    res.json({ message: 'Asset deleted' });
  } catch (err) {
    res.status(400).json({ message: 'Error deleting asset' });
  }
});

// Assign asset to user
// Assign asset to user (using email instead of userId)
router.post('/:id/assign', async (req, res) => {
  const { assignedTo } = req.body; // assignedTo is an email

  try {
    // Find user by email
    const user = await User.findOne({ email: assignedTo });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Assign the asset to the user
    const asset = await Asset.findByIdAndUpdate(
      req.params.id,
      {
        assignedTo: user._id,         // set user _id
        status: 'Assigned',
        dateAssigned: new Date()
      },
      { new: true }
    );

    res.json(asset);
  } catch (err) {
    console.error('Assignment error:', err);
    res.status(500).json({ message: 'Error assigning asset' });
  }
});


module.exports = router;
