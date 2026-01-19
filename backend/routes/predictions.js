const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const HealthData = require('../models/HealthData');
const User = require('../models/User');
const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

// Predict health status
router.post('/predict', auth, async (req, res) => {
  try {
    const { healthDataId } = req.body;

    // Get health data
    const healthData = await HealthData.findById(healthDataId);
    if (!healthData) {
      return res.status(404).json({ error: 'Health data not found' });
    }

    // Get user profile for additional context
    const user = await User.findById(req.userId);

    // Prepare data for ML service
    const predictionData = {
      metrics: healthData.metrics,
      userProfile: {
        age: user.profile.age,
        gender: user.profile.gender,
        weight: user.profile.weight,
        height: user.profile.height,
        occupation: user.profile.occupation,
        exerciseFrequency: user.profile.exerciseFrequency,
        sleepHours: user.profile.averageSleepHours
      }
    };

    // Call ML service
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/api/predict`, predictionData);
    
    // Update health data with prediction
    healthData.prediction = mlResponse.data.prediction;
    await healthData.save();

    res.json({
      message: 'Prediction completed successfully',
      prediction: mlResponse.data.prediction,
      healthData: healthData
    });
  } catch (error) {
    console.error('Prediction error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get nutrition recommendations
router.post('/nutrition', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const latestHealth = await HealthData.findOne({ userId: req.userId })
      .sort({ recordedAt: -1 });

    if (!latestHealth) {
      return res.status(404).json({ error: 'No health data found' });
    }

    const nutritionData = {
      occupation: user.profile.occupation,
      gender: user.profile.gender,
      age: user.profile.age,
      weight: user.profile.weight,
      height: user.profile.height,
      stressLevel: latestHealth.metrics.stressLevel,
      heartRate: latestHealth.metrics.heartRate,
      exerciseFrequency: user.profile.exerciseFrequency,
      dietType: user.profile.dietType,
      healthConditions: user.profile.currentChronicConditions
    };

    // Call ML service for nutrition recommendations
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/api/nutrition`, nutritionData);

    res.json(mlResponse.data);
  } catch (error) {
    console.error('Nutrition recommendation error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
