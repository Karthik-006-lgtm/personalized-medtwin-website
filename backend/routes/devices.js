const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Simulated device list
const AVAILABLE_DEVICES = [
  { id: 'fitband-001', name: 'FitBand Pro', type: 'Fitness Tracker', battery: 85 },
  { id: 'smartwatch-002', name: 'SmartWatch Ultra', type: 'Smartwatch', battery: 72 },
  { id: 'healthband-003', name: 'HealthBand Plus', type: 'Health Monitor', battery: 90 },
  { id: 'fitwatch-004', name: 'FitWatch 5', type: 'Fitness Watch', battery: 68 }
];

// Device OTP storage (in production, use Redis or similar)
const deviceOTPs = new Map();

// Scan for available devices
router.get('/scan', auth, async (req, res) => {
  try {
    // Simulate device scanning delay
    setTimeout(() => {
      res.json({
        devices: AVAILABLE_DEVICES,
        timestamp: new Date().toISOString()
      });
    }, 1500);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate OTP for device pairing
router.post('/generate-otp', auth, async (req, res) => {
  try {
    const { deviceId } = req.body;

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with expiration (5 minutes)
    deviceOTPs.set(`${req.userId}-${deviceId}`, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000
    });

    res.json({
      message: 'OTP generated successfully',
      deviceId,
      otp, // In production, send this to the device, not the response
      expiresIn: 300 // seconds
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify OTP and pair device
router.post('/pair', auth, async (req, res) => {
  try {
    const { deviceId, otp } = req.body;

    const key = `${req.userId}-${deviceId}`;
    const storedOTP = deviceOTPs.get(key);

    if (!storedOTP) {
      return res.status(400).json({ error: 'No OTP generated for this device' });
    }

    if (Date.now() > storedOTP.expiresAt) {
      deviceOTPs.delete(key);
      return res.status(400).json({ error: 'OTP has expired' });
    }

    if (storedOTP.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // OTP verified, pair the device
    const device = AVAILABLE_DEVICES.find(d => d.id === deviceId);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    const user = await User.findById(req.userId);
    
    // Check if device already paired
    const existingDevice = user.connectedDevices.find(d => d.deviceId === deviceId);
    if (!existingDevice) {
      user.connectedDevices.push({
        deviceId: device.id,
        deviceName: device.name,
        deviceType: device.type,
        pairedAt: new Date()
      });
      await user.save();
    }

    // Clear OTP
    deviceOTPs.delete(key);

    res.json({
      message: 'Device paired successfully',
      device: {
        deviceId: device.id,
        deviceName: device.name,
        deviceType: device.type
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get connected devices
router.get('/connected', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json({ devices: user.connectedDevices });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Disconnect device
router.delete('/disconnect/:deviceId', auth, async (req, res) => {
  try {
    const { deviceId } = req.params;
    const user = await User.findById(req.userId);

    user.connectedDevices = user.connectedDevices.filter(d => d.deviceId !== deviceId);
    await user.save();

    res.json({ message: 'Device disconnected successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sync data from device (simulated)
router.post('/sync/:deviceId', auth, async (req, res) => {
  try {
    const { deviceId } = req.params;

    // Simulate device data sync
    const simulatedData = {
      heartRate: Math.floor(60 + Math.random() * 40),
      bloodPressureSystolic: Math.floor(110 + Math.random() * 30),
      bloodPressureDiastolic: Math.floor(70 + Math.random() * 20),
      oxygenSaturation: Math.floor(95 + Math.random() * 5),
      temperature: (36.5 + Math.random() * 1.5).toFixed(1),
      steps: Math.floor(2000 + Math.random() * 8000),
      caloriesBurned: Math.floor(1500 + Math.random() * 1000),
      sleepHours: (6 + Math.random() * 3).toFixed(1),
      stressLevel: Math.floor(1 + Math.random() * 10)
    };

    res.json({
      message: 'Data synced successfully',
      deviceId,
      data: simulatedData,
      syncedAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
