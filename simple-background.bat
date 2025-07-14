@echo off
cd /d "%~dp0"
echo Personal Blaze - Background Service
echo ===================================
echo.
echo Starting helper service in background...

taskkill /f /im node.exe 2>nul >nul

powershell -WindowStyle Hidden -Command "Start-Process -FilePath 'node.exe' -ArgumentList 'personal-blaze-service.js' -WindowStyle Hidden"

timeout /t 2 /nobreak >nul

echo Background service started.
echo Press any key to close this window.
pause >nul