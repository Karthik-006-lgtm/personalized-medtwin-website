# Setup Guide - Health Monitoring Platform

Complete guide to set up and run the Health Monitoring Platform on your local machine.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Common Issues](#common-issues)

---

## ✅ Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

3. **Python** (v3.8 or higher)
   - Download from: https://www.python.org/
   - Verify installation: `python --version` or `python3 --version`

4. **pip** (comes with Python)
   - Verify installation: `pip --version` or `pip3 --version`

5. **MongoDB**
   - **Option A - Local Installation:**
     - Download from: https://www.mongodb.com/try/download/community
     - Start MongoDB: `mongod`
   
   - **Option B - MongoDB Atlas (Cloud):**
     - Sign up at: https://www.mongodb.com/cloud/atlas
     - Create a free cluster
     - Get your connection string

---

## 📦 Installation

### Step 1: Clone or Download the Project

```bash
# If using Git
git clone <repository-url>
cd health-monitoring-platform

# Or extract the downloaded ZIP file and navigate to the folder
```

### Step 2: Install Root Dependencies

```bash
npm install
```

### Step 3: Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### Step 4: Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### Step 5: Install ML Service Dependencies

```bash
cd ml-service

# On Windows
pip install -r requirements.txt

# On macOS/Linux
pip3 install -r requirements.txt

cd ..
```

---

## ⚙️ Configuration

### Step 1: Backend Configuration

Create `backend/.env` file:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/health-monitor
JWT_SECRET=my-super-secret-jwt-key-change-this
NODE_ENV=development
ML_SERVICE_URL=http://localhost:5001
```

**Important Notes:**
- If using MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string
- Change `JWT_SECRET` to a random secure string (you can generate one at: https://randomkeygen.com/)

### Step 2: Frontend Configuration

Create `frontend/.env` file:

```env
VITE_API_URL=http://localhost:5000
VITE_ML_URL=http://localhost:5001
```

### Step 3: ML Service Configuration

Create `ml-service/.env` file:

```env
PORT=5001
FLASK_ENV=development
```

---

## 🚀 Running the Application

### Option 1: Run All Services Together (Recommended)

From the root directory:

```bash
npm run dev
```

This will start:
- ✅ Backend API on http://localhost:5000
- ✅ ML Service on http://localhost:5001
- ✅ Frontend on http://localhost:5173

**Note:** Make sure MongoDB is running before starting the services!

### Option 2: Run Services Individually

**Terminal 1 - Start MongoDB:**
```bash
mongod
```

**Terminal 2 - Start Backend:**
```bash
cd backend
npm run dev
```

**Terminal 3 - Start ML Service:**
```bash
cd ml-service

# On Windows
python app.py

# On macOS/Linux
python3 app.py
```

**Terminal 4 - Start Frontend:**
```bash
cd frontend
npm run dev
```

---

## 🌐 Access the Application

Once all services are running, open your browser and visit:

**http://localhost:5173**

You should see the Health Monitoring Platform login page!

---

## 👤 Creating Your First Account

1. Click on **"Sign Up"**
2. Enter your email and password (minimum 6 characters)
3. Confirm your password
4. Click **"Sign Up"**
5. You'll be automatically logged in and redirected to the Dashboard

---

## 🧪 Testing the Features

### 1. Dashboard - Manual Entry
- Navigate to Dashboard
- Click "Manual Entry"
- Fill in health metrics (at least one)
- Click "Save Health Data"
- Click "Predict & Analyze Health Status"
- View your health insights and recommendations

### 2. Dashboard - Device Sync
- Click "Device Sync" tab
- Click "Scan for Devices"
- Select a device from the list
- Enter the OTP shown (it's displayed for demo purposes)
- Click "Pair Device"
- Click "Sync Data" on your connected device
- Data will be automatically filled
- Click "Predict & Analyze Health Status"

### 3. Profile Section
- Click "Profile" in the top navigation
- Click dropdown and select "View Profile"
- Upload an avatar or select a cartoon character
- Fill in your health information
- Click "Save Profile"

### 4. Medical Documents
- Click "Medical Documents" in navigation
- Click "Upload Document"
- Select document type (X-Ray, MRI, Prescription, or Lab Report)
- Choose a file from your computer
- Add notes (optional)
- Click "Upload"
- View, download, or delete documents

### 5. AI Nutrition Recommendations
- After getting health predictions on Dashboard
- Click "View AI Nutrition Recommendations"
- Explore personalized meal plans, snacks, drinks, and hydration schedule

### 6. Hydration Reminders
- The droplet icon in the navigation bar indicates hydration reminders
- Click it to toggle reminders on/off
- When enabled, you'll get a reminder every 2 hours

---

## ❓ Common Issues

### Issue: MongoDB Connection Error

**Error:** `MongoServerError: connect ECONNREFUSED`

**Solution:**
- Make sure MongoDB is running: `mongod`
- Check if MongoDB is installed correctly
- Or use MongoDB Atlas and update the connection string in `backend/.env`

### Issue: Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
- Another application is using that port
- Find and stop the process:
  ```bash
  # On Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F

  # On macOS/Linux
  lsof -ti:5000 | xargs kill -9
  ```
- Or change the port in `.env` files

### Issue: Python Module Not Found

**Error:** `ModuleNotFoundError: No module named 'flask'`

**Solution:**
```bash
cd ml-service
pip install -r requirements.txt
# or
pip3 install -r requirements.txt
```

### Issue: Frontend Not Loading

**Solution:**
- Make sure backend and ML service are running
- Check browser console for errors (F12)
- Verify `.env` file in frontend folder
- Clear browser cache and reload

### Issue: Cannot Install Dependencies

**Solution:**
- Delete `node_modules` folders
- Delete `package-lock.json` files
- Run `npm install` again
- Make sure you have the latest npm: `npm install -g npm@latest`

### Issue: Permission Denied (Linux/macOS)

**Solution:**
- Use `sudo` for global installations: `sudo npm install -g`
- For local installations, use: `npm install` without sudo
- Fix npm permissions: https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally

---

## 🔄 Stopping the Application

### If running with `npm run dev`:
- Press `Ctrl + C` in the terminal

### If running individually:
- Press `Ctrl + C` in each terminal window

---

## 📁 Project Structure

```
health-monitoring-platform/
├── backend/              # Node.js Express API
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Authentication middleware
│   ├── uploads/         # Uploaded files
│   └── server.js        # Main server file
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context
│   │   └── App.jsx      # Main app component
│   └── index.html
├── ml-service/          # Python Flask ML service
│   ├── app.py          # Main Flask app
│   ├── prediction_engine.py
│   └── nutrition_engine.py
├── package.json        # Root package file
└── README.md          # Main documentation
```

---

## 💡 Tips

1. **Keep services running:** Don't close the terminal windows while using the application
2. **Check logs:** If something doesn't work, check the terminal output for errors
3. **MongoDB:** Make sure MongoDB is always running before starting other services
4. **Browser cache:** Clear cache if you see old data or UI issues
5. **Environment variables:** Don't commit `.env` files to Git (they contain secrets)

---

## 🎓 Next Steps

Now that you have the application running:

1. Explore all features
2. Try different health metrics
3. View nutrition recommendations
4. Upload medical documents
5. Complete your profile
6. Check the progress graph

---

## 📞 Need Help?

If you encounter any issues not covered here:

1. Check the error messages in the terminal
2. Review the [DEPLOYMENT.md](DEPLOYMENT.md) for production setup
3. Check MongoDB connection
4. Verify all services are running
5. Make sure environment variables are set correctly

---

**Happy Health Monitoring! 🏥💪**
