# 🚀 Quick Start Guide - Health Monitoring Platform

Get your Health Monitoring Platform up and running in under 10 minutes!

## ⚡ Fastest Way to Start

### For Windows Users:

1. **Install Prerequisites:**
   - [Node.js](https://nodejs.org/) (v18+)
   - [Python](https://www.python.org/) (v3.8+)
   - [MongoDB](https://www.mongodb.com/try/download/community)

2. **Run the application:**
   ```bash
   # Double-click START.bat
   # OR run in terminal:
   START.bat
   ```

3. **Open browser:**
   - Go to http://localhost:5173

### For Mac/Linux Users:

1. **Install Prerequisites:**
   ```bash
   # Install Node.js (using nvm)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install 18

   # Install Python3 (usually pre-installed)
   python3 --version

   # Install MongoDB
   # For Mac:
   brew tap mongodb/brew
   brew install mongodb-community

   # For Ubuntu/Debian:
   sudo apt install mongodb
   ```

2. **Run the application:**
   ```bash
   chmod +x START.sh
   ./START.sh
   ```

3. **Open browser:**
   - Go to http://localhost:5173

---

## 📖 Manual Installation (Step by Step)

### Step 1: Install Dependencies

```bash
# Install all project dependencies
npm run install-all
```

### Step 2: Setup Environment Files

The application needs environment files. They're already created in the project:

- `backend/.env`
- `frontend/.env`
- `ml-service/.env`

**Important:** Change the `JWT_SECRET` in `backend/.env` for security!

### Step 3: Start MongoDB

```bash
# Start MongoDB service
mongod

# Or on Windows:
net start MongoDB

# Or on Mac/Linux:
sudo systemctl start mongod
```

### Step 4: Run the Application

```bash
# From project root directory
npm run dev
```

This starts all three services:
- ✅ Backend API (http://localhost:5000)
- ✅ ML Service (http://localhost:5001)
- ✅ Frontend (http://localhost:5173)

### Step 5: Access the App

Open your browser and navigate to:
**http://localhost:5173**

---

## 👤 First Time User Guide

### 1. Create Account
- Click **"Sign Up"**
- Enter email and password (min 6 characters)
- Confirm password
- Click **"Sign Up"**

### 2. Complete Profile (Recommended)
- Click **Profile** → **View Profile**
- Fill in your information:
  - Basic info (age, gender, occupation)
  - Health details (height, weight, conditions)
  - Lifestyle (exercise, diet, sleep)
- Click **"Save Profile"**

### 3. Add Health Data
- Go to **Dashboard**
- Choose **Manual Entry** or **Device Sync**

**Manual Entry:**
- Fill in health metrics (heart rate, blood pressure, etc.)
- Click **"Save Health Data"**

**Device Sync:**
- Click **"Scan for Devices"**
- Select a device
- Enter the OTP shown on screen (for demo)
- Click **"Sync Data"**

### 4. Get Health Analysis
- Click **"Predict & Analyze Health Status"**
- Wait for AI analysis (few seconds)
- View your health insights and recommendations

### 5. View Nutrition Plan
- After prediction, click **"View AI Nutrition Recommendations"**
- Explore personalized meal plans for 7 days
- Check healthy snacks and drinks
- Review hydration schedule

### 6. Upload Medical Documents
- Click **"Medical Documents"** in navigation
- Click **"Upload Document"**
- Select document type (X-Ray, MRI, Prescription, Lab Report)
- Choose file and click **"Upload"**

---

## 🎯 Key Features Overview

| Feature | Description | Location |
|---------|-------------|----------|
| 📊 **Health Dashboard** | Track and analyze health metrics | Dashboard |
| 📱 **Device Sync** | Connect fitness devices with OTP security | Dashboard → Device Sync |
| 🤖 **AI Predictions** | Get health insights and recommendations | Dashboard → Predict |
| 🍎 **Nutrition AI** | Personalized meal plans by occupation | After prediction |
| 💧 **Hydration Alerts** | 2-hour water reminders | Top navigation (water droplet icon) |
| 👤 **Profile Management** | Health info and progress tracking | Profile |
| 📁 **Document Vault** | Secure medical document storage | Medical Documents |
| 📈 **Progress Graphs** | Visual health improvement tracking | Profile page |

---

## 🔧 Troubleshooting

### Problem: "Cannot connect to MongoDB"
**Solution:**
```bash
# Make sure MongoDB is running
mongod

# Check if port 27017 is free
netstat -an | grep 27017
```

### Problem: "Port 5000 already in use"
**Solution:**
```bash
# Find process using port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5000 | xargs kill -9
```

### Problem: "Module not found" error
**Solution:**
```bash
# Reinstall dependencies
npm run install-all
```

### Problem: Frontend not loading
**Solution:**
1. Check if backend is running (http://localhost:5000/api/health-check)
2. Clear browser cache
3. Check browser console (F12) for errors

---

## 📱 Features Walkthrough

### Health Prediction Flow
1. Enter health data (manual or device)
2. Click "Predict"
3. AI analyzes your metrics
4. Get personalized insights
5. View recommendations
6. Check nutrition plan

### Device Pairing Process
1. Click "Scan for Devices"
2. Wait for scan to complete
3. Select device from list
4. System generates OTP on device
5. Enter OTP on website
6. Device pairs successfully
7. Click "Sync Data" to import metrics

### Nutrition Recommendations
- **7-Day Meal Plans** with exact calories
- **Occupation-based** suggestions
- **Gender-specific** advice
- **Health condition** considerations
- **Hydration schedule** with reminders

---

## 💡 Tips for Best Experience

1. **Complete your profile** for more accurate recommendations
2. **Enable hydration reminders** (water droplet icon)
3. **Regularly update health data** for trend tracking
4. **Upload medical documents** for better record-keeping
5. **Check nutrition plans** after each prediction

---

## 🌐 API Endpoints (For Developers)

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login

### Health Data
- `POST /api/health/data` - Save health metrics
- `GET /api/health/history` - Get history
- `GET /api/health/latest` - Get latest data

### Predictions
- `POST /api/predictions/predict` - Analyze health
- `POST /api/predictions/nutrition` - Get nutrition plan

### Devices
- `GET /api/devices/scan` - Scan for devices
- `POST /api/devices/pair` - Pair device
- `POST /api/devices/sync/:deviceId` - Sync data

### Documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents` - Get all documents
- `DELETE /api/documents/:id` - Delete document

---

## 📊 System Requirements

### Minimum Requirements:
- **OS:** Windows 10, macOS 10.15+, Ubuntu 20.04+
- **RAM:** 4GB
- **Storage:** 2GB free space
- **Browser:** Chrome 90+, Firefox 88+, Safari 14+

### Recommended:
- **RAM:** 8GB+
- **Storage:** 5GB+ free space
- **Internet:** Stable connection

---

## 🎓 Learning Resources

- **README.md** - Complete project overview
- **SETUP_GUIDE.md** - Detailed installation guide
- **DEPLOYMENT.md** - Production deployment guide
- **Code Documentation** - Comments in source code

---

## ✅ Checklist Before First Use

- [ ] Node.js installed
- [ ] Python installed
- [ ] MongoDB installed and running
- [ ] All dependencies installed (`npm run install-all`)
- [ ] Environment files created
- [ ] All services running
- [ ] Browser opened to http://localhost:5173

---

## 🎉 You're Ready!

Your Health Monitoring Platform is now set up and ready to use. Start by creating an account and exploring all the features!

**Need help?** Check the detailed guides:
- [SETUP_GUIDE.md](SETUP_GUIDE.md) for installation issues
- [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment

**Happy Health Tracking! 🏥💪**
