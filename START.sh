#!/bin/bash

echo "===================================="
echo "Health Monitoring Platform"
echo "Starting All Services..."
echo "===================================="
echo ""

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "Starting MongoDB..."
    mongod --fork --logpath /tmp/mongodb.log
    sleep 3
else
    echo "MongoDB is already running"
fi

# Start Backend
echo "Starting Backend API..."
cd backend
npm run dev > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
cd ..
sleep 2

# Start ML Service
echo "Starting ML Service..."
cd ml-service
python3 app.py > /tmp/ml-service.log 2>&1 &
ML_PID=$!
cd ..
sleep 2

# Start Frontend
echo "Starting Frontend..."
cd frontend
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo ""
echo "===================================="
echo "All services started!"
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:5000"
echo "ML Service: http://localhost:5001"
echo "===================================="
echo ""
echo "Process IDs:"
echo "Backend: $BACKEND_PID"
echo "ML Service: $ML_PID"
echo "Frontend: $FRONTEND_PID"
echo ""
echo "To stop all services, run:"
echo "kill $BACKEND_PID $ML_PID $FRONTEND_PID"
echo ""
echo "Logs are available at:"
echo "/tmp/backend.log"
echo "/tmp/ml-service.log"
echo "/tmp/frontend.log"
echo "/tmp/mongodb.log"
