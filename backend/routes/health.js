const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const HealthData = require('../models/HealthData');

// Submit health data (manual or device)
router.post('/data', auth, async (req, res) => {
  try {
    const { dataSource, deviceId, metrics } = req.body;

    const healthData = new HealthData({
      userId: req.userId,
      dataSource,
      deviceId,
      metrics
    });

    await healthData.save();

    res.status(201).json({
      message: 'Health data saved successfully',
      data: healthData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's health history
router.get('/history', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 30;
    const healthData = await HealthData.find({ userId: req.userId })
      .sort({ recordedAt: -1 })
      .limit(limit);

    res.json(healthData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get latest health data
router.get('/latest', auth, async (req, res) => {
  try {
    const latestData = await HealthData.findOne({ userId: req.userId })
      .sort({ recordedAt: -1 });

    res.json(latestData || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get health statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const data = await HealthData.find({
      userId: req.userId,
      recordedAt: { $gte: startDate }
    }).sort({ recordedAt: 1 });

    // Calculate averages
    const stats = {
      totalRecords: data.length,
      averages: {}
    };

    if (data.length > 0) {
      const metrics = ['heartRate', 'bloodPressureSystolic', 'bloodPressureDiastolic', 
                       'oxygenSaturation', 'steps', 'sleepHours', 'stressLevel'];
      
      metrics.forEach(metric => {
        const values = data.map(d => d.metrics[metric]).filter(v => v != null);
        if (values.length > 0) {
          stats.averages[metric] = values.reduce((a, b) => a + b, 0) / values.length;
        }
      });
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
