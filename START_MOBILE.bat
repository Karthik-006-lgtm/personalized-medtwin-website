@echo off
echo ========================================
echo Health Monitoring Platform - Mobile Access
echo ========================================
echo.
echo Starting all services with network access...
echo.
echo Your local IP: 192.168.1.8
echo.
echo Access URLs:
echo   - From this computer: http://localhost:5173
echo   - From phone (same WiFi): http://192.168.1.8:5173
echo.
echo ========================================
echo.

REM Start MongoDB
echo Starting MongoDB...
start "MongoDB" cmd /k "mongod"
timeout /t 3 /nobreak >nul

REM Start Backend
echo Starting Backend API...
start "Backend API" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul

REM Start ML Service
echo Starting ML Service...
start "ML Service" cmd /k "cd ml-service && python app.py"
timeout /t 3 /nobreak >nul

REM Start Frontend
echo Starting Frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo All services started!
echo ========================================
echo.
echo Open your browser:
echo   - Computer: http://localhost:5173
echo   - Phone: http://192.168.1.8:5173
echo.
echo Make sure your phone is on the same WiFi!
echo.
echo Press any key to stop all services...
pause >nul

REM Stop all services
taskkill /FI "WindowTitle eq MongoDB*" /T /F
taskkill /FI "WindowTitle eq Backend API*" /T /F
taskkill /FI "WindowTitle eq ML Service*" /T /F
taskkill /FI "WindowTitle eq Frontend*" /T /F

echo All services stopped.
pause
