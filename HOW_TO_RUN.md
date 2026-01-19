# 🎯 How to Run - Health Monitoring Platform

## ✅ Prerequisites Check

Before starting, make sure you have:

1. ✅ **Node.js 18+** installed
   - Check: Open terminal and type `node --version`
   - Should show: v18.x.x or higher
   - Download: https://nodejs.org/

2. ✅ **Python 3.8+** installed
   - Check: Type `python --version` or `python3 --version`
   - Should show: Python 3.8.x or higher
   - Download: https://www.python.org/

3. ✅ **MongoDB** installed
   - Check: Type `mongod --version`
   - Download: https://www.mongodb.com/try/download/community
   - **Alternative:** Use MongoDB Atlas (cloud) - https://www.mongodb.com/cloud/atlas

---

## 🚀 Quick Start (5 Steps)

### Step 1: Install All Dependencies

Open terminal in the project folder and run:

```bash
npm install
```

Then install backend dependencies:

```bash
cd backend
npm install
cd ..
```

Then install frontend dependencies:

```bash
cd frontend
npm install
cd ..
```

Then install ML service dependencies:

```bash
cd ml-service
pip install -r requirements.txt
# OR on Mac/Linux:
pip3 install -r requirements.txt
cd ..
```

### Step 2: Create Environment Files

The project already has `.env` files with default values. You're ready to go!

**Optional:** For production, update these files:
- `backend/.env` - Change `JWT_SECRET` to a secure random string
- `frontend/.env` - Update URLs if deploying
- `ml-service/.env` - Update port if needed

### Step 3: Start MongoDB

**Option A - Local MongoDB:**
```bash
mongod
```

**Option B - MongoDB Atlas:**
1. Create free cluster at https://www.mongodb.com/cloud/atlas
2. Get connection string
3. Update `MONGODB_URI` in `backend/.env`

### Step 4: Start All Services

**Windows:**
```bash
START.bat
```

**Mac/Linux:**
```bash
chmod +x START.sh
./START.sh
```

**Or manually start each service:**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - ML Service:
```bash
cd ml-service
python app.py
# OR on Mac/Linux:
python3 app.py
```

Terminal 3 - Frontend:
```bash
cd frontend
npm run dev
```

### Step 5: Open in Browser

Go to: **http://localhost:5173**

---

## 🎉 First Time Setup

### 1. Create Your Account
1. Click "Sign Up"
2. Enter email (example@email.com)
3. Enter password (minimum 6 characters)
4. Confirm password
5. Click "Sign Up" button

✅ You're automatically logged in!

### 2. Try the Dashboard
1. You'll see the Dashboard after login
2. Click "Manual Entry"
3. Fill in some health data:
   - Heart Rate: 72
   - Blood Pressure: 120/80
   - Oxygen Saturation: 98
   - Sleep Hours: 7
4. Click "Save Health Data"
5. Click "Predict & Analyze Health Status"
6. Wait a few seconds
7. ✨ View your health insights!

### 3. Try Device Sync (Demo Mode)
1. Click "Device Sync" tab
2. Click "Scan for Devices"
3. Select any device
4. You'll see an OTP on screen (this is demo mode)
5. Enter the OTP shown
6. Click "Pair Device"
7. Click "Sync Data" on your connected device
8. Data is automatically filled!

### 4. View Nutrition Recommendations
1. After getting health predictions
2. Click "View AI Nutrition Recommendations"
3. Explore:
   - 7-day meal plans
   - Healthy snacks
   - Drink recommendations
   - Hydration schedule
4. Navigate between days to see different meals

### 5. Complete Your Profile
1. Click "Profile" in top navigation
2. Select "View Profile" from dropdown
3. Click camera icon to set avatar
4. Fill in your information:
   - **Basic Info:** Name, Age, Gender, Occupation
   - **Health Details:** Height, Weight, Conditions
   - **Lifestyle:** Exercise, Diet, Sleep habits
5. Click "Save Profile"
6. View your progress graph!

### 6. Upload Medical Documents
1. Click "Medical Documents" in navigation
2. Click "Upload Document"
3. Choose document type:
   - X-Ray
   - MRI
   - Prescription
   - Lab Report
4. Select a file from your computer
5. Add notes (optional)
6. Click "Upload"
7. View, download, or delete anytime!

---

## 🔥 Cool Features to Try

### Hydration Reminders
- Look for the water droplet icon 💧 in the navigation bar
- Click it to toggle reminders on/off
- When enabled, you'll get a notification every 2 hours
- Stay hydrated! 💪

### Device Pairing with OTP
- Simulates real fitness device pairing
- OTP shown on screen (in real app, it's on device)
- Secure 6-digit verification
- Can connect multiple devices

### AI-Powered Nutrition
- Based on your occupation (Software Engineer, Driver, etc.)
- Gender-specific recommendations
- Health condition considerations
- Exact calorie measurements
- Full week meal planning

### Progress Tracking
- Go to Profile page
- See your health score over time
- Line graph shows improvement
- Track your health journey!

### Risk Assessment
- Low, Moderate, or High risk levels
- Color-coded indicators
- Specific areas needing attention
- Actionable recommendations

---

## 📱 Using the App

### Navigation Bar
- **Dashboard:** Home page, input health data
- **Medical Documents:** Upload and manage documents
- **Profile Dropdown:** 
  - View Profile
  - Logout
- **Water Droplet:** Toggle hydration reminders

### Dashboard Tabs
- **Manual Entry:** Type in your health metrics
- **Device Sync:** Connect fitness devices

### Profile Sections
- Basic Information
- Health Details
- Lifestyle Information
- Sleep Information
- Diet Information

---

## ⚠️ Common Issues & Solutions

### "Cannot connect to MongoDB"
**Problem:** MongoDB is not running

**Solution:**
```bash
# Start MongoDB
mongod

# Or on Windows as service:
net start MongoDB

# Or on Mac/Linux:
sudo systemctl start mongod
```

### "Port already in use"
**Problem:** Another app is using the port

**Solution:**
```bash
# Find and kill the process

# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# Mac/Linux:
lsof -ti:5000 | xargs kill -9
```

### "Module not found"
**Problem:** Dependencies not installed

**Solution:**
```bash
# Reinstall all dependencies
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
cd ml-service && pip install -r requirements.txt && cd ..
```

### Frontend shows blank page
**Problem:** Backend or ML service not running

**Solution:**
1. Make sure all 3 services are running
2. Check terminal for error messages
3. Verify URLs in `frontend/.env`:
   ```
   VITE_API_URL=http://localhost:5000
   VITE_ML_URL=http://localhost:5001
   ```

### "Failed to load profile"
**Problem:** Backend not connected or user not authenticated

**Solution:**
1. Check if backend is running
2. Try logging out and logging back in
3. Clear browser cookies and cache
4. Check browser console (F12) for errors

---

## 🌐 URLs & Ports

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:5173 | User interface |
| Backend API | http://localhost:5000 | REST API |
| ML Service | http://localhost:5001 | AI/ML predictions |
| MongoDB | localhost:27017 | Database |

---

## 🔧 Useful Commands

### Check if services are running:

```bash
# Check backend
curl http://localhost:5000/api/health-check

# Check ML service
curl http://localhost:5001/api/health-check
```

### Stop services:

**If using START.bat/START.sh:**
- Close the terminal windows

**If running manually:**
- Press `Ctrl + C` in each terminal

### Restart services:

```bash
# Just run the start command again
npm run dev
```

---

## 📊 Testing the Features

### Test Data Examples

**Health Metrics:**
- Heart Rate: 60-100 bpm (normal)
- Blood Pressure: 120/80 mmHg (normal)
- Oxygen Saturation: 95-100% (normal)
- Sleep Hours: 7-9 hours (good)
- Stress Level: 1-10 scale
- Steps: 5000-10000 (average)

**Profile Data:**
- Age: Your actual age
- Height: In cm (e.g., 170)
- Weight: In kg (e.g., 70)
- Occupation: Select from dropdown

---

## 💡 Pro Tips

1. **Complete your profile first** for accurate nutrition recommendations
2. **Enter health data regularly** to see progress over time
3. **Try both manual and device sync** to see different features
4. **Upload sample medical documents** to test the vault
5. **Enable hydration reminders** for the full experience
6. **Check different occupations** in profile to see varied nutrition plans
7. **Try different health metrics** to see how AI responds

---

## 🎓 Understanding the AI Features

### Health Prediction
- Analyzes all your metrics together
- Calculates overall health score (0-100)
- Determines risk level (Low/Moderate/High)
- Provides personalized insights
- Suggests specific improvements

### Nutrition Recommendations
- Based on your occupation's activity level
- Considers your gender for metabolic differences
- Adjusts for health conditions
- Provides exact calorie targets
- Creates 7-day meal plans with variety

### Hydration Reminders
- Background notification system
- Reminds every 2 hours
- Based on your weight and activity
- Helps maintain optimal hydration

---

## 📞 Need More Help?

- **Setup Issues:** Check [SETUP_GUIDE.md](SETUP_GUIDE.md)
- **Deployment:** Check [DEPLOYMENT.md](DEPLOYMENT.md)
- **Quick Reference:** Check [QUICK_START.md](QUICK_START.md)
- **Project Overview:** Check [README.md](README.md)

---

## ✅ Success Checklist

Before you say it's working, make sure:

- [ ] All dependencies installed
- [ ] MongoDB is running
- [ ] Backend started (http://localhost:5000)
- [ ] ML Service started (http://localhost:5001)
- [ ] Frontend started (http://localhost:5173)
- [ ] Can create an account
- [ ] Can save health data
- [ ] Can get predictions
- [ ] Can view nutrition recommendations
- [ ] Can upload documents
- [ ] Can update profile

---

## 🎉 You're All Set!

Your Health Monitoring Platform is now fully functional and ready to use!

Enjoy tracking your health with AI-powered insights! 🏥💪

**Happy Health Monitoring!**
