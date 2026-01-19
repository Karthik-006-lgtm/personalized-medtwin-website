@echo off
echo ====================================
echo Health Monitoring Platform
echo Starting All Services...
echo ====================================
echo.

echo Starting MongoDB...
start "MongoDB" mongod

timeout /t 3 /nobreak > nul

echo Starting Backend API...
start "Backend" cmd /k "cd backend && npm run dev"

timeout /t 2 /nobreak > nul

echo Starting ML Service...
start "ML Service" cmd /k "cd ml-service && python app.py"

timeout /t 2 /nobreak > nul

echo Starting Frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ====================================
echo All services started!
echo Frontend: http://localhost:5173
echo Backend: http://localhost:5000
echo ML Service: http://localhost:5001
echo ====================================
echo.
echo Press any key to exit...
pause > nul
