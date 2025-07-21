const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  category: String,
  value: Number,
  status: { type: String, enum: ['Available', 'Assigned','Under Maintenance'], default: 'Available' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  dateAssigned: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Asset', assetSchema);
