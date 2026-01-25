@echo off
echo ========================================
echo Switch Between Local and Network Mode
echo ========================================
echo.
echo Current mode: 
type frontend\.env 2>nul
echo.
echo ========================================
echo.
echo Choose mode:
echo 1. Local Mode (Computer only - localhost)
echo 2. Network Mode (Mobile access - 192.168.1.8)
echo.
set /p choice="Enter your choice (1 or 2): "

if "%choice%"=="1" (
    echo.
    echo Switching to LOCAL MODE...
    copy /Y frontend\.env.local frontend\.env >nul
    echo ✅ Switched to Local Mode
    echo.
    echo API URLs:
    echo   - Backend: http://localhost:5000
    echo   - ML Service: http://localhost:5001
    echo.
    echo Access: http://localhost:5173
) else if "%choice%"=="2" (
    echo.
    echo Switching to NETWORK MODE...
    copy /Y frontend\.env.network frontend\.env >nul
    echo ✅ Switched to Network Mode
    echo.
    echo API URLs:
    echo   - Backend: http://192.168.1.8:5000
    echo   - ML Service: http://192.168.1.8:5001
    echo.
    echo Access from:
    echo   - Computer: http://localhost:5173
    echo   - Phone: http://192.168.1.8:5173
) else (
    echo Invalid choice!
)

echo.
echo ⚠️ IMPORTANT: Restart the frontend for changes to take effect!
echo Run: cd frontend ^&^& npm run dev
echo.
pause
