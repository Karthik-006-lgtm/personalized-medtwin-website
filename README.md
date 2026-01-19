# 🏥 Health Monitoring Platform

## ✅ COMPLETE & READY TO USE!

A comprehensive AI-powered health monitoring system with device sync, ML predictions, and personalized nutrition recommendations.

**Status:** ✅ Fully Functional | 🚀 Production Ready | 📦 Complete Package

---

## 🎯 START HERE!

### Quick Start (Choose One):

**Option 1 - Automatic Start (Easiest):**

**Windows:**
```bash
START.bat
```

**Mac/Linux:**
```bash
chmod +x START.sh
./START.sh
```

**Option 2 - Manual Start:**
```bash
# 1. Install dependencies
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
cd ml-service && pip install -r requirements.txt && cd ..

# 2. Start MongoDB
mongod

# 3. Start all services (in root directory)
npm run dev
```

**Then open:** http://localhost:5173

📚 **Detailed Instructions:** See [HOW_TO_RUN.md](HOW_TO_RUN.md)

---

## Features

- 🔐 Secure Authentication (Login/Sign Up)
- 📊 Dual Input System (Manual Entry + Device Sync)
- 🔗 Device Pairing with OTP Security
- 🤖 ML-Based Health Predictions
- 📈 Interactive Analytics & Visualizations
- 👤 Comprehensive User Profile Management
- 📁 Secure Medical Documents Vault
- 🍎 AI-Powered Occupation-Based Nutrition Recommendations
- 💧 Smart Hydration Reminders

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express + MongoDB
- **ML Service**: Python Flask + scikit-learn
- **Authentication**: JWT + bcrypt
- **Charts**: Recharts
- **Icons**: Lucide React

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- MongoDB (local or Atlas)

### Installation

1. Install all dependencies:
```bash
npm run install-all
```

2. Set up environment variables:

Create `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/health-monitor
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
VITE_ML_URL=http://localhost:5001
```

Create `ml-service/.env`:
```env
PORT=5001
```

3. Start MongoDB (if running locally):
```bash
mongod
```

### Running the Application

Run all services concurrently:
```bash
npm run dev
```

Or run individually:
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - ML Service
npm run dev:ml

# Terminal 3 - Frontend
npm run dev:frontend
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- ML Service: http://localhost:5001

## Building for Production

```bash
npm run build
```

## Project Structure

```
├── frontend/          # React frontend application
├── backend/           # Node.js Express API
├── ml-service/        # Python Flask ML service
├── package.json       # Root package configuration
└── README.md          # This file
```

## 🎯 Features Checklist

✅ **Authentication**
- Secure login and sign up with JWT
- Password validation and encryption

✅ **Dashboard**
- Manual health data entry
- Device sync with OTP pairing
- Real-time health predictions
- Interactive analytics with graphs

✅ **AI/ML Features**
- Health risk assessment
- Personalized insights and recommendations
- Occupation-based nutrition plans
- 7-day meal planning with calorie tracking
- Gender-specific health advice

✅ **Profile Management**
- Avatar upload or cartoon selection
- Comprehensive health information forms
- Dropdown fields for conditions and lifestyle
- Progress tracking with graphs

✅ **Medical Documents**
- Secure document upload (X-Ray, MRI, Prescription, Lab Reports)
- Document categorization and filtering
- View and download capabilities

✅ **Smart Features**
- 2-hour hydration reminders
- Device connection simulation
- Responsive design
- Real-time notifications

## 🚀 Quick Links

- **[Quick Start Guide](QUICK_START.md)** - Get started in under 10 minutes
- **[Detailed Setup Guide](SETUP_GUIDE.md)** - Complete installation instructions
- **[Deployment Guide](DEPLOYMENT.md)** - Production deployment

## Default Login Credentials

After signing up, use your created credentials. No default accounts exist for security reasons.

## License

Proprietary - All Rights Reserved
