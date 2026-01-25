@echo off
echo ========================================
echo Health Monitoring Platform - Streamlit
echo ========================================
echo.
echo Starting Streamlit app with network access...
echo.
echo Your local IP: 192.168.1.8
echo.
echo Access URLs:
echo   - From this computer: http://localhost:8501
echo   - From phone (same WiFi): http://192.168.1.8:8501
echo.
echo ========================================
echo.
echo Make sure Backend and ML services are running!
echo.

cd streamlit-app
streamlit run app.py --server.address 0.0.0.0 --server.port 8501

pause
