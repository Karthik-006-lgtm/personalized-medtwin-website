const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profile: {
    avatar: { type: String, default: '' },
    // Basic Info
    name: { type: String, default: '' },
    age: { type: Number },
    gender: { type: String, enum: ['Male', 'Female', 'Other', ''], default: '' },
    occupation: { 
      type: String, 
      enum: ['', 'Software Engineer', 'Driver', 'Teacher', 'Doctor', 'Nurse', 'Student', 'Chef', 'Sales Professional', 'Manager', 'Accountant', 'Construction Worker', 'Other'],
      default: '' 
    },
    // Health Details
    height: { type: Number }, // cm
    weight: { type: Number }, // kg
    bloodType: { type: String, enum: ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], default: '' },
    currentChronicConditions: [{ 
      type: String, 
      enum: ['None', 'Diabetes', 'Hypertension', 'Heart Disease', 'Asthma', 'Arthritis', 'Thyroid Disorder', 'Other']
    }],
    pastChronicConditions: [{ 
      type: String, 
      enum: ['None', 'Diabetes', 'Hypertension', 'Heart Disease', 'Asthma', 'Arthritis', 'Thyroid Disorder', 'Other']
    }],
    allergies: { type: String, default: '' },
    // Lifestyle Info
    exerciseFrequency: { 
      type: String, 
      enum: ['', 'Daily', '3-5 times/week', '1-2 times/week', 'Rarely', 'Never'],
      default: '' 
    },
    alcoholConsumption: { 
      type: String, 
      enum: ['', 'Never', 'Occasionally', 'Weekly', 'Daily'],
      default: '' 
    },
    // Sleep Info
    averageSleepHours: { type: Number },
    sleepIssues: { 
      type: String, 
      enum: ['', 'None', 'Insomnia', 'Sleep Apnea', 'Restless Sleep', 'Other'],
      default: '' 
    },
    // Diet Info
    dietType: { 
      type: String, 
      enum: ['', 'Vegetarian', 'Vegan', 'Non-Vegetarian', 'Pescatarian', 'Other'],
      default: '' 
    },
    mealsPerDay: { type: Number }
  },
  connectedDevices: [{
    deviceId: String,
    deviceName: String,
    deviceType: String,
    pairedAt: { type: Date, default: Date.now }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
