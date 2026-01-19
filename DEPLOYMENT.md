# Deployment Guide - Health Monitoring Platform

This guide will help you deploy the Health Monitoring Platform to production.

## 🚀 Quick Deployment Steps

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- MongoDB (local or Atlas)
- A server (VPS, AWS EC2, DigitalOcean, etc.)

---

## 📦 Local Development Setup

### 1. Clone and Install

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install ML service dependencies
cd ../ml-service
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create the following `.env` files:

**backend/.env**:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/health-monitor
JWT_SECRET=change-this-to-a-secure-random-string
NODE_ENV=development
ML_SERVICE_URL=http://localhost:5001
```

**frontend/.env**:
```env
VITE_API_URL=http://localhost:5000
VITE_ML_URL=http://localhost:5001
```

**ml-service/.env**:
```env
PORT=5001
FLASK_ENV=development
```

### 3. Start MongoDB

```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in backend/.env with your Atlas connection string
```

### 4. Run All Services

```bash
# From root directory
npm run dev
```

This starts:
- Backend API on http://localhost:5000
- ML Service on http://localhost:5001
- Frontend on http://localhost:5173

---

## 🌐 Production Deployment

### Option 1: Traditional VPS Deployment (Ubuntu)

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python
sudo apt install -y python3 python3-pip

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Nginx
sudo apt install -y nginx

# Install PM2 (Process Manager)
sudo npm install -g pm2
```

#### 2. Clone and Setup Application

```bash
# Clone repository
cd /var/www
sudo git clone <your-repo-url> health-monitor
cd health-monitor

# Install dependencies
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
cd ml-service && pip3 install -r requirements.txt && cd ..
```

#### 3. Configure Production Environment

**backend/.env**:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/health-monitor
JWT_SECRET=<generate-a-secure-random-string>
NODE_ENV=production
ML_SERVICE_URL=http://localhost:5001
```

**frontend/.env**:
```env
VITE_API_URL=https://your-domain.com
VITE_ML_URL=https://your-domain.com/ml
```

#### 4. Build Frontend

```bash
cd frontend
npm run build
```

#### 5. Setup PM2 Processes

```bash
# Start backend
cd backend
pm2 start server.js --name health-backend

# Start ML service
cd ../ml-service
pm2 start app.py --name health-ml --interpreter python3

# Save PM2 configuration
pm2 save
pm2 startup
```

#### 6. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/health-monitor
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/health-monitor/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # ML Service
    location /ml {
        rewrite ^/ml/(.*) /api/$1 break;
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads
    location /uploads {
        alias /var/www/health-monitor/backend/uploads;
    }
}
```

Enable site and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/health-monitor /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 7. Setup SSL with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

#### 8. Setup Firewall

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

---

### Option 2: Docker Deployment

#### 1. Create Dockerfile for Backend

**backend/Dockerfile**:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

#### 2. Create Dockerfile for ML Service

**ml-service/Dockerfile**:
```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5001

CMD ["python", "app.py"]
```

#### 3. Create docker-compose.yml

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/health-monitor
      - JWT_SECRET=${JWT_SECRET}
      - ML_SERVICE_URL=http://ml-service:5001
    depends_on:
      - mongodb

  ml-service:
    build: ./ml-service
    ports:
      - "5001:5001"

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
      - ml-service

volumes:
  mongodb_data:
```

Run with Docker:

```bash
docker-compose up -d
```

---

### Option 3: Cloud Platform Deployment

#### Vercel (Frontend Only)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy frontend:
```bash
cd frontend
vercel
```

3. Configure environment variables in Vercel dashboard

#### Railway / Render (Full Stack)

1. Connect your GitHub repository
2. Add three services:
   - Backend (Node.js)
   - ML Service (Python)
   - Frontend (Static Site)
3. Configure environment variables for each service
4. Deploy

#### AWS / DigitalOcean / Google Cloud

Follow their respective deployment guides for Node.js and Python applications.

---

## 🔒 Security Checklist

- [ ] Change JWT_SECRET to a strong random string
- [ ] Use HTTPS (SSL certificate)
- [ ] Enable MongoDB authentication
- [ ] Set up firewall rules
- [ ] Use environment variables for sensitive data
- [ ] Enable CORS only for your domain
- [ ] Regularly update dependencies
- [ ] Set up automated backups for MongoDB
- [ ] Implement rate limiting
- [ ] Use secure session management

---

## 📊 Monitoring

### PM2 Monitoring

```bash
# View all processes
pm2 list

# View logs
pm2 logs

# Monitor resources
pm2 monit

# Restart services
pm2 restart all
```

### MongoDB Monitoring

```bash
# Check status
sudo systemctl status mongod

# View logs
sudo tail -f /var/log/mongodb/mongod.log
```

---

## 🔄 Updates

To update the application:

```bash
# Pull latest code
cd /var/www/health-monitor
git pull

# Update dependencies
npm install
cd backend && npm install && cd ..
cd ml-service && pip3 install -r requirements.txt && cd ..

# Rebuild frontend
cd frontend
npm install
npm run build

# Restart services
pm2 restart all
```

---

## 🆘 Troubleshooting

### Backend not starting

```bash
# Check logs
pm2 logs health-backend

# Check MongoDB connection
mongo --eval "db.adminCommand('ping')"
```

### Frontend not loading

```bash
# Check Nginx configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### ML Service issues

```bash
# Check Python dependencies
pip3 list

# Check logs
pm2 logs health-ml
```

---

## 📝 Backup Strategy

### MongoDB Backup

```bash
# Manual backup
mongodump --out=/backup/mongodb-$(date +%Y%m%d)

# Automated daily backup (cron)
0 2 * * * mongodump --out=/backup/mongodb-$(date +\%Y\%m\%d)
```

### Application Backup

```bash
# Backup uploaded files
tar -czf /backup/uploads-$(date +%Y%m%d).tar.gz /var/www/health-monitor/backend/uploads
```

---

## 🎉 Success!

Your Health Monitoring Platform should now be live and accessible at your domain!

For support or questions, refer to the main README.md file.
