# 📱 Mobile & Network Access Guide

## Access Your Website on Phone

### Step 1: Make Sure All Services Are Running
Your computer must be running:
- ✅ Backend (Port 5000)
- ✅ ML Service (Port 5001)
- ✅ Frontend (Port 5173)
- ✅ MongoDB

### Step 2: Find Your Computer's IP Address
Your local IP address is: **192.168.1.8**

To verify or find it again:
```bash
ipconfig | findstr IPv4
```

### Step 3: Access from Your Phone

**Make sure your phone is on the SAME WiFi network as your computer!**

Open your phone's browser and go to:
```
http://192.168.1.8:5173
```

### Step 4: Share with Friends

Your friends can access it too if they're on the same WiFi network:
```
http://192.168.1.8:5173
```

---

## 🔥 For Internet Access (Anyone, Anywhere)

To make it accessible from anywhere on the internet, you have several options:

### Option 1: ngrok (Easiest - Free)

1. **Download ngrok**: https://ngrok.com/download
2. **Install and authenticate**
3. **Run these commands in separate terminals:**

```bash
# Terminal 1 - Expose Frontend
ngrok http 5173

# Terminal 2 - Expose Backend
ngrok http 5000

# Terminal 3 - Expose ML Service
ngrok http 5001
```

4. **Update frontend .env with ngrok URLs**
5. **Share the frontend ngrok URL with anyone!**

### Option 2: Deploy to Cloud (Production)

**Frontend Options:**
- Netlify (Free): https://www.netlify.com/
- Vercel (Free): https://vercel.com/
- GitHub Pages (Free)

**Backend Options:**
- Render (Free): https://render.com/
- Railway (Free tier): https://railway.app/
- Heroku (Paid)

**Database:**
- MongoDB Atlas (Free): https://www.mongodb.com/cloud/atlas

---

## 🚀 Quick Start for Mobile Access

### On Your Computer:
1. Restart all services with the updated configuration
2. Note your IP: **192.168.1.8**

### On Your Phone:
1. Connect to the same WiFi
2. Open browser
3. Go to: `http://192.168.1.8:5173`
4. Enjoy! 🎉

---

## ⚠️ Troubleshooting

### "Can't connect from phone"
- ✅ Check both devices are on same WiFi
- ✅ Check Windows Firewall isn't blocking ports
- ✅ Try disabling firewall temporarily to test

### "Connection refused"
- ✅ Make sure all services are running
- ✅ Verify IP address is correct
- ✅ Check if ports 5000, 5001, 5173 are accessible

### Allow Firewall Access (Windows):
```bash
# Run as Administrator
netsh advfirewall firewall add rule name="Health Monitor Frontend" dir=in action=allow protocol=TCP localport=5173
netsh advfirewall firewall add rule name="Health Monitor Backend" dir=in action=allow protocol=TCP localport=5000
netsh advfirewall firewall add rule name="Health Monitor ML" dir=in action=allow protocol=TCP localport=5001
```

---

## 📊 Network URLs Summary

| Service | Local URL | Network URL |
|---------|-----------|-------------|
| Frontend | http://localhost:5173 | http://192.168.1.8:5173 |
| Backend | http://localhost:5000 | http://192.168.1.8:5000 |
| ML Service | http://localhost:5001 | http://192.168.1.8:5001 |

---

## 🎯 Best Practices

1. **For Testing with Friends (Same WiFi)**: Use local IP (192.168.1.8)
2. **For Demo to Anyone**: Use ngrok
3. **For Production**: Deploy to cloud services

---

**Your website is now accessible on mobile devices! 📱✨**
