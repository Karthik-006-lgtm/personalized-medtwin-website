# 🏥 Health Monitoring Platform - Streamlit Version

A beautiful, interactive Streamlit web application for health monitoring with AI-powered predictions and nutrition recommendations.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd streamlit-app
pip install -r requirements.txt
```

### 2. Make Sure Backend Services Are Running

Before starting Streamlit, ensure these are running:
- Backend API (http://localhost:5000)
- ML Service (http://localhost:5001)
- MongoDB

### 3. Run Streamlit App

```bash
streamlit run app.py
```

The app will open automatically in your browser at: **http://localhost:8501**

---

## 📱 Access on Mobile

### Local Network Access

1. Find your computer's IP address (e.g., 192.168.1.8)
2. Make sure your phone is on the same WiFi
3. Open browser on phone and go to:
   ```
   http://192.168.1.8:8501
   ```

### Internet Access (Using ngrok)

```bash
# Install ngrok from https://ngrok.com/download
# Then run:
ngrok http 8501
```

Share the ngrok URL with anyone to access your app from anywhere!

---

## ✨ Features

### 🔐 Authentication
- User login and signup
- Secure session management
- Token-based authentication

### 📊 Dashboard
- Real-time health metrics display
- Interactive charts and graphs
- Health trends visualization
- Key metrics at a glance

### 📝 Health Data Entry
- Manual health data input
- Multiple health parameters:
  - Heart Rate
  - Blood Pressure
  - Oxygen Saturation
  - Body Temperature
  - Blood Glucose
  - Sleep Hours
  - Steps & Calories
  - Stress Level
  - Weight

### 🤖 AI Predictions
- Health risk assessment
- Overall health score
- Personalized recommendations
- Areas for improvement
- Positive indicators

### 🍎 Nutrition Plan
- 7-day meal plans
- Breakfast, lunch, dinner suggestions
- Calorie information
- Healthy snacks and drinks
- Occupation-based recommendations

### 📁 Medical Documents
- Upload medical documents
- Categorize by type (X-Ray, MRI, Prescription, Lab Report)
- View and manage documents
- Add notes to documents

### 👤 Profile Management
- Basic information
- Health details
- Lifestyle information
- Comprehensive user profile

---

## 🎨 Features Highlights

### Beautiful UI
- Modern, clean design
- Gradient color schemes
- Responsive layout
- Interactive components

### Easy Navigation
- Sidebar navigation
- Tab-based organization
- Intuitive user flow

### Real-time Updates
- Live data visualization
- Interactive charts with Plotly
- Instant feedback

### Mobile-Friendly
- Responsive design
- Touch-friendly interface
- Works on all devices

---

## 🔧 Configuration

### API Endpoints

Edit these in `app.py` if your backend runs on different ports:

```python
BACKEND_URL = "http://localhost:5000/api"
ML_URL = "http://localhost:5001/api"
```

### For Network Access

To allow access from other devices on your network:

```bash
streamlit run app.py --server.address 0.0.0.0
```

---

## 📊 Tech Stack

- **Streamlit**: Web framework
- **Plotly**: Interactive charts
- **Pandas**: Data manipulation
- **Requests**: API communication
- **Python 3.8+**: Programming language

---

## 🎯 Usage Tips

1. **First Time**: Create an account using the Sign Up tab
2. **Login**: Use your credentials to access the dashboard
3. **Enter Data**: Go to "Health Data Entry" to input your metrics
4. **Get Predictions**: Visit "AI Predictions" for health insights
5. **View Nutrition**: Check "Nutrition Plan" for meal recommendations
6. **Upload Documents**: Use "Medical Documents" to store files
7. **Update Profile**: Complete your profile for better recommendations

---

## 🌐 Deployment Options

### Streamlit Cloud (Free)
1. Push code to GitHub
2. Go to https://streamlit.io/cloud
3. Connect your repository
4. Deploy with one click!

### Heroku
```bash
# Create Procfile
echo "web: streamlit run app.py --server.port $PORT" > Procfile

# Deploy
heroku create your-app-name
git push heroku main
```

### Docker
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8501
CMD ["streamlit", "run", "app.py"]
```

---

## 🔥 Advanced Features

### Custom Styling
The app includes custom CSS for:
- Gradient backgrounds
- Colored alert boxes
- Responsive cards
- Modern typography

### Session Management
- Persistent login state
- Secure token storage
- Automatic logout

### Error Handling
- Graceful error messages
- Connection retry logic
- User-friendly alerts

---

## 📱 Mobile Access Commands

### Run with Network Access
```bash
streamlit run app.py --server.address 0.0.0.0 --server.port 8501
```

### Find Your IP
```bash
# Windows
ipconfig | findstr IPv4

# Mac/Linux
ifconfig | grep inet
```

### Access from Phone
```
http://YOUR_IP:8501
```

---

## 🎉 Benefits of Streamlit Version

✅ **Faster Development**: Built in pure Python
✅ **Easy Deployment**: One-click deploy to Streamlit Cloud
✅ **Interactive**: Built-in widgets and components
✅ **Beautiful**: Modern UI out of the box
✅ **Mobile-Friendly**: Responsive by default
✅ **No Frontend Code**: No HTML/CSS/JavaScript needed
✅ **Real-time Updates**: Automatic re-rendering
✅ **Easy Sharing**: Simple URL sharing

---

## 🆚 Streamlit vs React Version

| Feature | Streamlit | React (Original) |
|---------|-----------|------------------|
| Development Speed | ⚡ Very Fast | 🐢 Slower |
| Learning Curve | 📚 Easy | 📚📚 Moderate |
| Customization | 🎨 Good | 🎨🎨🎨 Excellent |
| Mobile Access | 📱 Built-in | 📱 Requires config |
| Deployment | 🚀 One-click | 🚀 Multi-step |
| Performance | ⚡ Good | ⚡⚡ Better |

---

## 🎓 Learning Resources

- **Streamlit Docs**: https://docs.streamlit.io/
- **Plotly Docs**: https://plotly.com/python/
- **Streamlit Gallery**: https://streamlit.io/gallery

---

## ⚠️ Troubleshooting

### "Connection refused"
- Make sure backend services are running
- Check API URLs in app.py

### "Module not found"
- Install requirements: `pip install -r requirements.txt`

### "Can't access from phone"
- Use `--server.address 0.0.0.0`
- Check firewall settings
- Verify same WiFi network

---

## 🎯 Next Steps

1. ✅ Install dependencies
2. ✅ Run backend services
3. ✅ Start Streamlit app
4. ✅ Access from browser
5. ✅ Test on mobile
6. ✅ Share with friends!

---

**Enjoy your Streamlit Health Monitoring Platform! 🏥✨**
