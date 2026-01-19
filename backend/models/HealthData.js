const mongoose = require('mongoose');

const healthDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dataSource: {
    type: String,
    enum: ['manual', 'device'],
    required: true
  },
  deviceId: {
    type: String,
    default: null
  },
  metrics: {
    heartRate: { type: Number }, // bpm
    bloodPressureSystolic: { type: Number }, // mmHg
    bloodPressureDiastolic: { type: Number }, // mmHg
    oxygenSaturation: { type: Number }, // SpO2 %
    temperature: { type: Number }, // Celsius
    steps: { type: Number },
    caloriesBurned: { type: Number },
    sleepHours: { type: Number },
    stressLevel: { type: Number, min: 1, max: 10 }, // 1-10 scale
    bloodGlucose: { type: Number }, // mg/dL
    weight: { type: Number } // kg
  },
  prediction: {
    overallHealthScore: { type: Number }, // 0-100
    riskLevel: { type: String, enum: ['Low', 'Moderate', 'High'] },
    insights: [String],
    recommendations: [String],
    areasNeedingAttention: [String]
  },
  recordedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('HealthData', healthDataSchema);
