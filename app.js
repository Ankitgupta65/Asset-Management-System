require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');

// Route imports
const authRoutes = require('./routes/auth');         // 🔐 Authentication routes
const assetRoutes = require('./routes/assets');      // 💼 Asset routes
const complaintRoutes = require('./routes/complaints'); // 🛠 Complaint routes



const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Serve static frontend files (HTML/CSS/JS in /public)
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Register API routes
app.use('/api/auth', authRoutes);          // /api/auth/...
app.use('/api/assets', assetRoutes);       // /api/assets/...
app.use('/api/complaints', complaintRoutes); // /api/complaints/...

// ✅ Dashboard route
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/dashboard.html'));
});

// ✅ Connect to MongoDB and start the server
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ MongoDB connected');
  app.listen(PORT, () => {
    console.log(`🚀 Server running at: http://localhost:${PORT}`);
  });
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
});
