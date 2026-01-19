const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/avatars');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for avatar upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update profile fields
    if (updates.profile) {
      user.profile = { ...user.profile, ...updates.profile };
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: await User.findById(req.userId).select('-password')
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload avatar
router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const user = await User.findById(req.userId);
    
    // Delete old avatar if exists
    if (user.profile.avatar && !user.profile.avatar.startsWith('http')) {
      const oldPath = path.join(__dirname, '../', user.profile.avatar);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    user.profile.avatar = `/uploads/avatars/${req.file.filename}`;
    await user.save();

    res.json({
      message: 'Avatar uploaded successfully',
      avatarUrl: user.profile.avatar
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Set cartoon avatar
router.post('/avatar/cartoon', auth, async (req, res) => {
  try {
    const { avatarUrl } = req.body;
    const user = await User.findById(req.userId);

    user.profile.avatar = avatarUrl;
    await user.save();

    res.json({
      message: 'Avatar updated successfully',
      avatarUrl: user.profile.avatar
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
